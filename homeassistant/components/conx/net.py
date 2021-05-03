import time
import asyncio
import socket
import select
import binascii
import logging
import threading
from timeit import default_timer as timer
from typing import Any, Dict, Callable

from homeassistant.util import get_local_ip
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import Entity
from homeassistant.const import CONF_NAME

from .db import DB

_LOGGER = logging.getLogger(__name__)


class Connection:
    def __init__(
        self,
        id: str,
        addr,
        onNetworkMessage: Callable[[str, bytearray], None],
        timeout: float,
        keeptime: float,
        ping: bytearray,
    ):
        self.id = id
        self.addr = addr
        self.onNetworkMessage = onNetworkMessage
        self.rbuff: bytearray = bytearray(b"")
        self.wbuff: bytearray = bytearray(b"")
        self.sock: socket = None
        self.timeout = timeout
        self.keeptime = keeptime
        self.readTS = timer()
        self.writeTS = timer()
        self.ping = ping
        print("create connection", id, addr)

    def clear(self):
        self.sock = None
        self.rbuff = bytearray(b"")
        self.wbuff = bytearray(b"")

    def Send(self, data: bytearray):
        if None == self.sock:
            print(self.id, " is not connected")
            return

        self.wbuff += data
        print("send", self.id, self.wbuff)

    def read(self, size: int) -> bool:
        rv: bool = True
        data = self.sock.recv(size)
        if len(data) > 0:
            self.rbuff += data
            self.readTS = timer()
        else:
            rv = False

        return rv

    def send(self):
        if len(self.wbuff) > 0:
            self.sock.send(self.wbuff)
            self.wbuff = b""
            self.writeTS = timer()

    def keepAlive(self):
        if None == self.sock:
            return

        ts = timer()
        rt = ts - self.readTS
        if rt > self.timeout:
            self.sock.close()
            self.sock = None
            self.readTS = ts
            self.writeTS = ts
            return

        wt = ts - self.writeTS
        if wt > self.keeptime:
            self.Send(self.ping)
            wt = ts


class TCPConnThread(threading.Thread):
    def __init__(self, main: Callable[[], None]):
        threading.Thread.__init__(self)
        self.main = main

    def run(self):
        self.main()


class TCP(threading.Thread):
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        threading.Thread.__init__(self)

        self.connections: Dict[str, Connection] = {}
        self.connThread = TCPConnThread(self.handleConnections)

        self.active = True
        self.connThread.start()
        self.start()

    def Connect(
        self,
        id: str,
        ip: str,
        port: int,
        onNetworkMessage: Callable[[str, bytearray], None],
        timeout: float,
        keeptime: float,
        ping: bytearray,
    ):
        if id not in self.connections:
            self.connections[id] = Connection(
                id, (ip, port), onNetworkMessage, timeout, keeptime, ping
            )

    def Send(self, id: str, data: bytearray):
        c: Connection = self._getConnByID(id)
        if None == c:
            return False
        c.Send(data)

    def handleConnections(self):
        while self.active:
            count: int = 0
            connections = self.connections.copy()
            for cid in connections:
                c: Connection = connections[cid]
                if None == c.sock:
                    count += 1
                    try:
                        s = socket.create_connection(c.addr, 0.1)
                        if s != None:
                            s.setblocking(0)
                            c.sock = s
                            c.readTS = timer()
                            c.writeTS = timer()
                            self._onConnected(c)
                    except:
                        pass
            if count <= 0:
                time.sleep(0.1)

    def run(self):
        while self.active:
            sockets = []
            connections = self.connections.copy()

            for cid in connections:
                c: Connection = connections[cid]
                if None != c.sock:
                    sockets.append(c.sock)

            if len(sockets) <= 0:
                time.sleep(0.1)
                continue

            try:
                ts = timer()
                readable, writable, exceptional = select.select(
                    sockets, sockets, sockets, 0.1
                )

                for s in readable:
                    self._onRead(s)

                for s in writable:
                    self._onWrite(s)

                for s in exceptional:
                    self._onExp(s)

                es = timer() - ts
                if es < 0.1:
                    time.sleep(0.1 - es)

                for cid in connections:
                    connections[cid].keepAlive()

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

    def callNetworkMessage(self, c: Connection, cmd: str):
        if None == c.onNetworkMessage:
            return False
        c.onNetworkMessage(cmd, c.rbuff)
        return True

    def _onConnected(self, c):
        self.callNetworkMessage(c, "connected")

    def _onRead(self, s: socket):
        c: Connection = self._getConnection(s)
        if None == c:
            return

        if False == c.read(1024):
            self._onExp(s)
            return

        self.callNetworkMessage(c, "read")

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
        self.callNetworkMessage(c, "disconnect")

    def onTick(self, elapse: float):
        pass

    def onStop(self):
        self.stop()


class UDP:
    def __init__(self, hass: HomeAssistant, conx, config: dict):
        print("Starting UDP server")
        self.db: DB = conx.db
        # host_ip_addr = socket.gethostbyname(socket.getfqdn())
        host_ip_addr = get_local_ip()
        print("host ip addr: ", host_ip_addr)
        _LOGGER.debug("host ip addr: %s", host_ip_addr)
        """
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setblocking(False)

        # Required for receiving multicast
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        self.sock.bind((host_ip_addr, 10103))
        self.listen = hass.loop.create_datagram_endpoint(
            lambda: UDPServerProtocol(self, hass.loop, self.sock), sock=self.sock
        )
        self.task = hass.async_create_task(self.listen)
        """

    def onStop(self):
        pass

    def onTick(self, elapse: float):
        pass

    def onMessage(self, data, addr):
        print("onMessage ", data, addr)

    def onError(self, data, addr):
        print("onError ", data, addr)

    def sendto(self, call):
        entities = None
        try:
            print("sendto", call)
            entities = self.db.GetEntities(call.data.get("entity_id"))
            if None == entities:
                return False

            ip = call.data.get("ip")
            port = call.data.get("port")
            data = call.data.get("data")

            for e in entities:
                en = e["entity"]
                if hasattr(en, "sendTo"):
                    en.sendTo((ip, port), data)
        except Exception as ex:
            print("sendto fail", ex)


class UDPServerProtocol:
    def __init__(self, parent, loop, sock):
        """Initialize the UDPServerProtocol."""

        self.transport = None
        self.parent = parent
        self.loop = loop
        self.sock = sock
        parent.protocol = self

    def connection_made(self, transport):
        self.transport = transport

    def connection_lost(self, exc):
        _LOGGER.debug("connection_lost: %s", exc)

    def datagram_received(self, data, addr):
        self.parent.onMessage(data, addr)

    def error_received(self, exc):
        self.parent.onError(exc)

    def close(self):
        if self.transport:
            self.transport.close()
        self.loop.remove_writer(self.sock.fileno())
        self.loop.remove_reader(self.sock.fileno())
        self.sock.close()


class UDPSensor(Entity):
    def __init__(self, conx, config):
        self._db: DB = conx.db
        self.hass = conx.hass
        self.tcp: TCP = conx.tcp
        self._name = config.get(CONF_NAME)
        self.ip = config.get("ip")
        self.port = config.get("port")
        self.echo: bool = config.get("echo")

        self._state: str = ""

        host_ip_addr = get_local_ip()
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.setblocking(False)

        # Required for receiving multicast
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        self.sock.bind((host_ip_addr, self.port))
        self.listen = self.hass.loop.create_datagram_endpoint(
            lambda: UDPServerProtocol(self, self.hass.loop, self.sock), sock=self.sock
        )
        self.task = self.hass.async_create_task(self.listen)

    def onError(self, data, addr):
        print("onError ", data, addr)
        self._state = data.decode("utf-8")
        self.async_write_ha_state()

    def onMessage(self, data, addr):
        print("onMessage ", data, addr)
        self._state = data.decode("utf-8")
        self.async_write_ha_state()
        if self.echo:
            self.sock.sendto(data, addr)

    def sendTo(self, addr, data):
        if "0x" != data[:2]:
            byteData = data.encode("utf-8")
        else:
            byteData = bytes.fromhex(data[2:])

        self.sock.sendto(byteData, addr)

    @property
    def name(self):
        return self._name

    @property
    def state(self):
        return self._state

    @property
    def unit_of_measurement(self):
        return "string"

    @property
    def should_poll(self):
        return False

    def async_update(self):
        pass
