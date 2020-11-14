import asyncio
import socket
import select
import logging
import threading
from timeit import default_timer as timer
from typing import Any, Dict, Callable

from homeassistant.util import get_local_ip
from homeassistant.core import HomeAssistant

from .db import DB

_LOGGER = logging.getLogger(__name__)


class Connection:
    def __init__(
        self, id: str, addr: (str, int), onNet: Callable[[str, bytearray], None]
    ):
        self.id = id
        self.addr = addr
        self.onNet = onNet
        self.rbuff: bytearray = b""
        self.wbuff: bytearray = b""
        self.sock: socket = None

    def clear(self):
        self.sock = None
        self.rbuff = b""
        self.wbuff = b""

    def Send(self, data: bytearray):
        self.wbuff += data
        print("send", self.id, self.wbuff)

    def read(self, size: int) -> bool:
        rv: bool = True
        data = self.sock.recv(size)
        if len(data) > 0:
            self.rbuff += data
        else:
            rv = False

        return rv

    def readBuff(self) -> bytearray:
        data: bytearray = self.rbuff
        self.rbuff = b""

        return data

    def send(self):
        if len(self.wbuff) > 0:
            self.sock.send(self.wbuff)
            self.wbuff = b""


class TCPConnThread(threading.Thread):
    def __init__(self, main: Callable[[], None]):
        threading.Thread.__init__(self)
        self.main = main

    def run(self):
        self.main()


class TCP(threading.Thread):
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        threading.Thread.__init__(self)

        self.connections: Dict[str, Connection] = {}
        self.connThread = TCPConnThread(self.handleConnections)

        self.active = True
        self.connThread.start()
        self.start()

    def Connect(
        self, id: str, ip: str, port: int, onNet: Callable[[str, bytearray], None]
    ):
        if id not in self.connections:
            self.connections[id] = Connection(id, (ip, port), onNet)

    def Send(self, id: str, data: bytearray):
        c: Connection = self._getConnByID(id)
        if None == c:
            return False
        c.Send(data)

    def handleConnections(self):
        while self.active:
            connections = self.connections.copy()
            for cid in connections:
                c: Connection = connections[cid]
                if None == c.sock:
                    try:
                        s = socket.create_connection(c.addr, 0.1)
                        if s != None:
                            s.setblocking(0)
                            c.sock = s
                            self._onConnected(c)
                    except:
                        pass

    def run(self):
        while self.active:
            sockets = []
            connections = self.connections.copy()

            for cid in connections:
                c: Connection = connections[cid]
                if None != c.sock:
                    sockets.append(c.sock)

            try:
                readable, writable, exceptional = select.select(
                    sockets, sockets, sockets, 0.1
                )

                for s in readable:
                    self._onRead(s)

                for s in writable:
                    self._onWrite(s)

                for s in exceptional:
                    self._onExp(s)

            except Exception as ex:
                _LOGGER.error("Conx Responder socket exception occurred: %s", ex)
                continue

    def stop(self):
        self.active = False
        self.join()

    def _getConnByID(self, id: str) -> Connection:
        conn: Connection = None
        for c in self.connections:
            if id == self.connections[c].id:
                conn = self.connections[c]
                break

        return conn

    def _getConnection(self, s: socket) -> Connection:
        conn: Connection = None
        for c in self.connections:
            if s == self.connections[c].sock:
                conn = self.connections[c]
                break

        return conn

    def callOnNet(self, c: Connection, cmd: str, data: bytearray):
        if None == c.onNet:
            return False
        c.onNet(cmd, data)
        return True

    def _onConnected(self, c):
        self.callOnNet(c, "connected", None)

    def _onRead(self, s: socket):
        c: Connection = self._getConnection(s)
        if None == c:
            return

        if False == c.read(1024):
            self._onExp(s)
            return

        data = c.readBuff()
        self.callOnNet(c, "read", data)

    def _onWrite(self, s: socket):
        c: Connection = self._getConnection(s)
        if None == c:
            return

        c.send()

    def _onExp(self, s: socket):
        c: Connection = self._getConnection(s)
        if None == c:
            return
        c.clear()
        self.callOnNet(c, "disconnect", None)

    def onTick(self, elapse: float):
        pass

    def onStop(self):
        self.stop()


class UDP:
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        print("Starting UDP server")
        self.db = db
        # host_ip_addr = socket.gethostbyname(socket.getfqdn())
        host_ip_addr = get_local_ip()
        print("host ip addr: ", host_ip_addr)
        _LOGGER.debug("host ip addr: %s", host_ip_addr)
        sdp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sdp.setblocking(False)

        # Required for receiving multicast
        sdp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sdp.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        sdp.bind((host_ip_addr, 10103))
        self.listen = hass.loop.create_datagram_endpoint(
            lambda: UDPServerProtocol(self, hass.loop, sdp), sock=sdp
        )
        self.task = hass.async_create_task(self.listen)

    def onStop(self):
        pass

    def onTick(self, elapse: float):
        pass

    def onMessage(self, data, addr):
        print("onMessage ", data, addr)

    def onError(self, data, addr):
        print("onError ", data, addr)


class UDPServerProtocol:
    def __init__(self, udp, loop, sock):
        """Initialize the UDPServerProtocol."""

        self.transport = None
        self.udp = udp
        self.loop = loop
        self.sock = sock
        udp.protocol = self

    def connection_made(self, transport):
        self.transport = transport

    def connection_lost(self, exc):
        _LOGGER.debug("connection_lost: %s", exc)

    def datagram_received(self, data, addr):
        self.udp.onMessage(data, addr)

    def error_received(self, exc):
        self.udp.onError(exc)

    def close(self):
        if self.transport:
            self.transport.close()
        self.loop.remove_writer(self.sock.fileno())
        self.loop.remove_reader(self.sock.fileno())
        self.sock.close()