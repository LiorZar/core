"""The conx integration."""
import asyncio
import select
import socket
import json
import threading
import logging
import sqlalchemy
from sqlalchemy.orm import scoped_session, sessionmaker

from homeassistant.util import get_local_ip
import voluptuous as vol

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from homeassistant.components.recorder import CONF_DB_URL, DEFAULT_DB_FILE, DEFAULT_URL

from .const import DOMAIN
from homeassistant.const import (
    CONF_PORT,
    EVENT_HOMEASSISTANT_START,
    EVENT_HOMEASSISTANT_STOP,
)
import homeassistant.helpers.config_validation as cv

_LOGGER = logging.getLogger(__name__)
PLATFORMS = ["light"]

CONFIG_SCHEMA = vol.Schema(
    {DOMAIN: vol.Schema({vol.Required(CONF_PORT): cv.string})}, extra=vol.ALLOW_EXTRA
)


async def async_setup(hass: HomeAssistant, config: dict):
    print("async_setup Hello World!\n")
    # hass.states.async_set("conx.ConX", "Works!")

    port = config[DOMAIN][CONF_PORT]
    conx = ConX(hass, config.get(CONF_DB_URL), port)
    hass.data[DOMAIN] = conx

    hass.services.async_register(DOMAIN, "istate", conx.get_istate)
    return True


class ConX:
    """Representation of an Arduino board."""

    def __init__(self, hass: HomeAssistant, db_url, port):
        """Initialize the Conx."""
        self.hass = hass
        self.port = port
        self.hass = hass
        self.initDB(db_url)

        print("Starting UDP server")
        # One protocol instance will be created to serve all client requests

        # asyncio UDP Echo version https://docs.python.org/3.5/library/asyncio-protocol.html#udp-echo-server-protocol
        host_ip_addr = socket.gethostbyname(socket.getfqdn())
        host_ip_addr = get_local_ip()
        # host_ip_addr = "127.0.0.1"
        print("host ip addr: %s", host_ip_addr)
        ssdp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        ssdp_socket.setblocking(False)

        # Required for receiving multicast
        ssdp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        ssdp_socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        ssdp_socket.bind((host_ip_addr, 9999))
        self.listen = hass.loop.create_datagram_endpoint(
            lambda: EchoServerProtocol(self, hass.loop, ssdp_socket), sock=ssdp_socket
        )
        self.task = hass.async_create_task(self.listen)

        # asyncio TCP Echo version https://docs.python.org/3.5/library/asyncio-protocol.html#tcp-echo-server-protocol
        # self.listen = hass.loop.create_server(            EchoServerClientProtocol, "127.0.0.1", 8888        )
        # self.task = hass.async_create_task(self.listen)

        # just a simple select udp socket thread
        # self.thr = ConxNetThread()
        # self.thr.start()

    def initDB(self, db_url):
        self.initStates = {}

        if not db_url:
            db_url = DEFAULT_URL.format(
                hass_config_path=self.hass.config.path(DEFAULT_DB_FILE)
            )

        try:
            engine = sqlalchemy.create_engine(db_url)
            sessmaker = scoped_session(sessionmaker(bind=engine))

            # Run a dummy query just to test the db_url
            sess = sessmaker()
            result = sess.execute(
                "SELECT s.entity_id, s.state, s.attributes FROM states s INNER JOIN (SELECT max(state_id) id, entity_id FROM states group by entity_id) d on s.state_id = d.id;"
            )
            if not result.returns_rows or result.rowcount == 0:
                _LOGGER.warning("not states results")
                return

            for res in result:
                _LOGGER.debug("result = %s", res.items())
                self.initStates[res._row[0]] = {
                    "state": res._row[1],
                    "atts": json.loads(res._row[2]),
                }

        except sqlalchemy.exc.SQLAlchemyError as err:
            _LOGGER.error("Couldn't connect using %s DB_URL: %s", db_url, err)
            return
        finally:
            sess.close()

        self.sessmaker = sessmaker

    def get_istate(self, call):
        print("result", call)
        id = call.data.get("id")
        if id == None:
            _LOGGER.error("service:istate, no id")
            return None

        state = self.initStates.get(id)
        if state == None:
            _LOGGER.error("service:istate, no state")
            return None

        attr = call.data.get("attr")
        if attr == None:
            return state.get("state")

        return state.get("atts").get(attr)


class EchoServerProtocol:
    def __init__(self, conx, loop, ssdp_socket):
        """Initialize the EchoServerProtocol."""

        self.transport = None
        self.conx = conx
        self._loop = loop
        self._sock = ssdp_socket
        conx.echo = self

    def connection_made(self, transport):
        self.transport = transport
        _LOGGER.debug("host ip connection_made: %s", transport)
        # self.transport.sendto(message.encode(), ("255.255.255.255", 8888))
        # self.transport.sendto(message.encode(), ("192.168.1.24", 8888))
        # self.transport.sendto(("he man").encode(), ("192.168.1.25", 8888))

    def connection_lost(self, exc):
        """Handle connection lost."""
        print("connection_lost:", exc)
        _LOGGER.debug("connection_lost: %s", exc)

    def datagram_received(self, data, addr):
        message = data
        _LOGGER.debug("datagram_received: %s", data)
        print("Received %r from %s" % (message, addr))
        print("Send %r to %s" % (message, addr))
        self.transport.sendto(data, addr)

    def error_received(self, exc):
        print("Error received:", exc)
        _LOGGER.debug("Error received: %s", exc)

    def close(self):
        """Stop the server."""
        _LOGGER.info("conx responder shutting down")
        if self.transport:
            self.transport.close()
        self._loop.remove_writer(self._sock.fileno())
        self._loop.remove_reader(self._sock.fileno())
        self._sock.close()


class EchoServerClientProtocol(asyncio.Protocol):
    def __init__(self):
        """Initialize the EchoServerClientProtocol."""

        self.transport = None

    def connection_made(self, transport):
        peername = transport.get_extra_info("peername")
        print("Connection from {}".format(peername))
        self.transport = transport

    def data_received(self, data):
        message = data.decode()
        print("Data received: {!r}".format(message))

        print("Send: {!r}".format(message))
        self.transport.write(data)

        print("Close the client socket")
        self.transport.close()


class ConxNetThread(threading.Thread):

    _interrupted = False

    def __init__(self):
        """Initialize the class."""
        threading.Thread.__init__(self)

        self._socket = None
        self.host_ip_addr = "127.0.0.1"

    def run(self):
        """Run the server."""
        # Listen for UDP port 1900 packets sent to SSDP multicast address
        self._socket = _socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # _socket.setblocking(False)

        # Required for receiving multicast
        _socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

        _socket.setsockopt(
            socket.SOL_IP, socket.IP_MULTICAST_IF, socket.inet_aton(self.host_ip_addr)
        )

        _socket.setsockopt(
            socket.SOL_IP,
            socket.IP_ADD_MEMBERSHIP,
            socket.inet_aton("239.255.255.250") + socket.inet_aton(self.host_ip_addr),
        )
        a = socket.getfqdn()
        b = socket.gethostbyname(a)
        _socket.bind((b, 9999))

        while True:
            if self._interrupted:
                return

            try:
                read, _, _ = select.select([_socket], [], [_socket], 2)

                if _socket in read:
                    data, addr = _socket.recvfrom(1024)
                else:
                    # most likely the timeout, so check for interrupt
                    continue

                # data, addr = _socket.recvfrom(1024)

            except OSError as ex:
                if self._interrupted:
                    return

                _LOGGER.error(
                    "Conx Responder socket exception occurred: %s", ex.__str__
                )
                # without the following continue, a second exception occurs
                # because the data object has not been initialized
                continue

            response = self._handle_request(data)

            resp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            resp_socket.sendto(response, addr)
            resp_socket.close()

    def stop(self):
        """Stop the server."""
        # Request for server
        self._interrupted = True
        if self._socket:
            clean_socket_close(self._socket)
        self.join()

    def _handle_request(self, data):
        return self._prepare_response("urn:schemas-upnp-org:device:basic:1", f"uuid:")

    def _prepare_response(self, search_target, unique_service_name):
        # Note that the double newline at the end of
        # this string is required per the SSDP spec
        response = f"""HTTP/1.1 200 OK"""
        return response.replace("\n", "\r\n").encode("utf-8")


def clean_socket_close(sock):
    """Close a socket connection and logs its closure."""
    _LOGGER.info("Conx responder shutting down")

    sock.close()
