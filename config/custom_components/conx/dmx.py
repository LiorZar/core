import time
import socket
import logging
import threading
from struct import pack
from homeassistant.core import HomeAssistant

from .const import DOMAIN, EVENT_UNIVERSE_CHANGE
from .db import DB

_LOGGER = logging.getLogger(__name__)


class Universe:
    def __init__(self, hass: HomeAssistant, config: dict, lock, state):
        print("Init Universe", config, state)
        self.hass = hass
        self.lock = lock
        self.name = config["name"]
        self.universe = config["universe"]
        self.subnet = config["subnet"]
        self.ip = config["ip"]
        self.port = config["port"]
        self.level = config["level"]
        self.fps = config["fps"]
        self.keep = config["keep"]
        self.frameTime = 1.0 / self.fps if self.fps > 0 else 1000000
        self.channelCount = config["channels"]
        self.channels = [self.level] * self.channelCount
        self.duration = 0
        self.update = True
        self.keepDuration = 0
        self.keepDirty = True
        self.seq = 1

        if state == None or state.get("state") == None:
            return

        s = state.get("state")
        for i in range(0, len(s), 2):
            j = i // 2
            if j < self.channelCount:
                self.channels[j] = int(s[i : i + 2], 16)

    def setChannel(self, ch, val):
        idx = [ch]
        vals = [val]
        if isinstance(ch, list):
            idx = list(range(ch[0], ch[1] + 1, ch[2] if len(ch) >= 3 else 1))
            cnt = len(idx)

            if not isinstance(val, list):
                vals = [val] * cnt
            else:
                vals = [0] * cnt
                st = val[0]
                en = val[1]
                dt = (en - st) / (cnt - 1)
                for i in range(0, cnt):
                    vals[i] = st + i * dt

        cnt = len(idx)
        vals = [int(max(min(round(x * 2.55), 255), 0)) for x in vals]

        self.lock.acquire()
        try:
            for i in range(0, cnt):
                j = idx[i] - 1
                v = vals[i]
                if j < self.channelCount:
                    self.channels[j] = v
        finally:
            self.lock.release()

        self.hass.bus.async_fire(EVENT_UNIVERSE_CHANGE + self.name)
        self.update = True
        self.keepDirty = True

    def getChannels(self, idx):
        cnt = len(idx)
        vals = [0] * cnt
        for i in range(0, cnt):
            j = idx[i] - 1
            if j < self.channelCount:
                vals[i] = self.channels[j]
        return vals

    def setChannels(self, idx, vals):
        cnt = len(idx)

        self.lock.acquire()
        try:
            for i in range(0, cnt):
                j = idx[i] - 1
                v = vals[i]
                if j < self.channelCount:
                    self.channels[j] = v
        finally:
            self.lock.release()

        self.update = True
        self.keepDirty = True

    def should_send(self, elapse: float):
        self.duration += elapse
        if not self.update and self.duration < self.frameTime:
            return False
        self.update = False
        self.duration = 0.0
        return True

    def should_keep(self, elapse: float):
        self.keepDuration += elapse
        if not self.keepDirty or self.keepDuration < 1.0:
            return False
        self.keepDirty = False
        self.keepDuration = 0
        return True


class DMX:
    def __init__(self, hass: HomeAssistant, db: DB, config: dict):
        print("Starting DMX server")
        self.hass = hass
        self.db = db
        self.config = config.get("dmx")
        self.universes = {}
        self.lock = threading.Lock()
        for unv in self.config:
            u = Universe(
                hass, unv, self.lock, self.db.get_state(DOMAIN + "." + unv["name"])
            )
            self.universes[u.name] = u

        self._socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)  # UDP
        self._socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)

        packet = bytearray()
        packet.extend(map(ord, "Art-Net"))
        packet.append(0x00)  # Null terminate Art-Net
        packet.extend([0x00, 0x50])  # Opcode ArtDMX 0x5000 (Little endian)
        packet.extend([0x00, 0x0E])  # Protocol version 14
        self._base_packet = packet

    def get_universe(self, name):
        return self.universes[name]

    def set_channel(self, call):
        print("set_channel", call)
        name = call.data.get("name")
        channel = call.data.get("channel")
        value = call.data.get("value")
        if name == None or channel == None or value == None:
            return False

        unv: Universe = self.universes[name]
        if unv == None:
            return False

        unv.setChannel(channel, value)

        return True

    def set_universe(self, call):
        print("set_universe", call)
        name = call.data.get("name")
        universe = call.data.get("universe")
        subnet = call.data.get("subnet")
        fps = call.data.get("fps")
        if name == None:
            return False

        unv: Universe = self.universes[name]
        if unv == None:
            return False

        if universe != None:
            unv.universe = universe
        if subnet != None:
            unv.subnet = subnet
        if fps != None:
            self.fps = fps
            self.frameTime = 1.0 / self.fps if self.fps > 0 else 1000000

        return True

    def send(self, unv: Universe):
        """Send the current state of DMX values to the gateway via UDP packet."""
        # Copy the base packet then add the channel array
        packet = self._base_packet[:]
        packet.extend(bytes([unv.seq, unv.universe]))  # Sequence, Physical
        packet.extend([unv.universe, unv.subnet])  # Universe
        packet.extend(pack(">h", unv.channelCount))
        self.lock.acquire()
        try:
            packet.extend(unv.channels)
            self._socket.sendto(packet, (unv.ip, unv.port))
        finally:
            self.lock.release()

    def keep(self, unv: Universe):
        self.lock.acquire()
        try:
            str = "".join("{:02x}".format(x) for x in unv.channels)
            self.db.save_state(DOMAIN + "." + unv.name, str)
        finally:
            self.lock.release()

    def onTick(self, elapse: float):
        for u in self.universes:
            unv: Universe = self.universes[u]
            if unv.should_send(elapse):
                self.send(unv)
            if unv.should_keep(elapse):
                self.keep(unv)
