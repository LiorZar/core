from typing import Any, Callable, List, Optional
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers.entity import Entity


import math
from .const import DOMAIN, clamp, fract


class Ease:
    # from http://www.roguebasin.com/index.php?title=Bresenham%27s_Line_Algorithm#Python
    @staticmethod
    def getLine(x1, y1, x2, y2):
        """Returns a list of (x, y) tuples of every point on a line between
        (x1, y1) and (x2, y2). The x and y values inside the tuple are integers.

        Line generated with the Bresenham algorithm.

        Args:
        x1 (int, float): The x coordinate of the line's start point.
        y1 (int, float): The y coordinate of the line's start point.
        x2 (int, float): The x coordinate of the line's end point.
        y2 (int, float): The y coordiante of the line's end point.

        Returns:
        [(x1, y1), (x2, y2), (x3, y3), ...]

        Example:
        >>> getLine(0, 0, 6, 6)
        [(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6)]
        >>> getLine(0, 0, 3, 6)
        [(0, 0), (0, 1), (1, 2), (1, 3), (2, 4), (2, 5), (3, 6)]
        >>> getLine(3, 3, -3, -3)
        [(3, 3), (2, 2), (1, 1), (0, 0), (-1, -1), (-2, -2), (-3, -3)]
        """
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        points = []
        issteep = abs(y2 - y1) > abs(x2 - x1)
        if issteep:
            x1, y1 = y1, x1
            x2, y2 = y2, x2
        rev = False
        if x1 > x2:
            x1, x2 = x2, x1
            y1, y2 = y2, y1
            rev = True
        deltax = x2 - x1
        deltay = abs(y2 - y1)
        error = int(deltax / 2)
        y = y1
        ystep = None
        if y1 < y2:
            ystep = 1
        else:
            ystep = -1
        for x in range(x1, x2 + 1):
            if issteep:
                points.append((y, x))
            else:
                points.append((x, y))
            error -= deltay
            if error < 0:
                y += ystep
                error += deltax
        # Reverse the list if the coordinates were reversed
        if rev:
            points.reverse()
        return points

    @staticmethod
    def getPointOnLine(x1, y1, x2, y2, n):
        """Returns the (x, y) tuple of the point that has progressed a proportion
        n along the line defined by the two x, y coordinates.

        Args:
        x1 (int, float): The x coordinate of the line's start point.
        y1 (int, float): The y coordinate of the line's start point.
        x2 (int, float): The x coordinate of the line's end point.
        y2 (int, float): The y coordiante of the line's end point.
        n (float): Progress along the line. 0.0 is the start point, 1.0 is the end point. 0.5 is the midpoint. This value can be less than 0.0 or greater than 1.0.

        Returns:
        Tuple of floats for the x, y coordinate of the point.

        Example:
        >>> getPointOnLine(0, 0, 6, 6, 0)
        (0, 0)
        >>> getPointOnLine(0, 0, 6, 6, 1)
        (6, 6)
        >>> getPointOnLine(0, 0, 6, 6, 0.5)
        (3.0, 3.0)
        >>> getPointOnLine(0, 0, 6, 6, 0.75)
        (4.5, 4.5)
        >>> getPointOnLine(3, 3, -3, -3, 0.5)
        (0.0, 0.0)
        >>> getPointOnLine(3, 3, -3, -3, 0.25)
        (1.5, 1.5)
        >>> getPointOnLine(3, 3, -3, -3, 0.75)
        (-1.5, -1.5)
        """
        x = ((x2 - x1) * n) + x1
        y = ((y2 - y1) * n) + y1
        return (x, y)

    @staticmethod
    def _checkRange(n):
        """Raises ValueError if the argument is not between 0.0 and 1.0."""
        if not 0.0 <= n <= 1.0:
            raise ValueError("Argument must be between 0.0 and 1.0.")

    @staticmethod
    def InLinear(n):
        Ease._checkRange(n)
        return n

    @staticmethod
    def OutLinear(n):
        Ease._checkRange(n)
        return n

    @staticmethod
    def InOutLinear(n):
        Ease._checkRange(n)
        return n

    @staticmethod
    def InQuad(n):
        """A quadratic tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return n ** 2

    @staticmethod
    def OutQuad(n):
        """A quadratic tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return -n * (n - 2)

    @staticmethod
    def InOutQuad(n):
        """A quadratic tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        if n < 0.5:
            return 2 * n ** 2
        else:
            n = n * 2 - 1
            return -0.5 * (n * (n - 2) - 1)

    @staticmethod
    def InCubic(n):
        """A cubic tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return n ** 3

    @staticmethod
    def OutCubic(n):
        """A cubic tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = n - 1
        return n ** 3 + 1

    @staticmethod
    def InOutCubic(n):
        """A cubic tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = 2 * n
        if n < 1:
            return 0.5 * n ** 3
        else:
            n = n - 2
            return 0.5 * (n ** 3 + 2)

    @staticmethod
    def InQuart(n):
        """A quartic tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return n ** 4

    @staticmethod
    def OutQuart(n):
        """A quartic tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = n - 1
        return -(n ** 4 - 1)

    @staticmethod
    def InOutQuart(n):
        """A quartic tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = 2 * n
        if n < 1:
            return 0.5 * n ** 4
        else:
            n = n - 2
            return -0.5 * (n ** 4 - 2)

    @staticmethod
    def InQuint(n):
        """A quintic tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return n ** 5

    @staticmethod
    def OutQuint(n):
        """A quintic tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = n - 1
        return n ** 5 + 1

    @staticmethod
    def InOutQuint(n):
        """A quintic tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = 2 * n
        if n < 1:
            return 0.5 * n ** 5
        else:
            n = n - 2
            return 0.5 * (n ** 5 + 2)

    @staticmethod
    def InSine(n):
        """A sinusoidal tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return -1 * math.cos(n * math.pi / 2) + 1

    @staticmethod
    def OutSine(n):
        """A sinusoidal tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return math.sin(n * math.pi / 2)

    @staticmethod
    def InOutSine(n):
        """A sinusoidal tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return -0.5 * (math.cos(math.pi * n) - 1)

    @staticmethod
    def InExpo(n):
        """An exponential tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        if n == 0:
            return 0
        else:
            return 2 ** (10 * (n - 1))

    @staticmethod
    def OutExpo(n):
        """An exponential tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        if n == 1:
            return 1
        else:
            return -(2 ** (-10 * n)) + 1

    @staticmethod
    def InOutExpo(n):
        """An exponential tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        if n == 0:
            return 0
        elif n == 1:
            return 1
        else:
            n = n * 2
            if n < 1:
                return 0.5 * 2 ** (10 * (n - 1))
            else:
                n -= 1
                # 0.5 * (-() + 2)
                return 0.5 * (-1 * (2 ** (-10 * n)) + 2)

    @staticmethod
    def InCirc(n):
        """A circular tween function that begins slow and then accelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return -1 * (math.sqrt(1 - n * n) - 1)

    @staticmethod
    def OutCirc(n):
        """A circular tween function that begins fast and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n -= 1
        return math.sqrt(1 - (n * n))

    @staticmethod
    def InOutCirc(n):
        """A circular tween function that accelerates, reaches the midpoint, and then decelerates.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = n * 2
        if n < 1:
            return -0.5 * (math.sqrt(1 - n ** 2) - 1)
        else:
            n = n - 2
            return 0.5 * (math.sqrt(1 - n ** 2) + 1)

    @staticmethod
    def InElastic(n, amplitude=1, period=0.3):
        """An elastic tween function that begins with an increasing wobble and then snaps into the destination.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return 1 - Ease.OutElastic(1 - n, amplitude=amplitude, period=period)

    @staticmethod
    def OutElastic(n, amplitude=1, period=0.3):
        """An elastic tween function that overshoots the destination and then "rubber bands" into the destination.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)

        if amplitude < 1:
            amplitude = 1
            s = period / 4
        else:
            s = period / (2 * math.pi) * math.asin(1 / amplitude)

        return (
            amplitude * 2 ** (-10 * n) * math.sin((n - s) * (2 * math.pi / period)) + 1
        )

    @staticmethod
    def InOutElastic(n, amplitude=1, period=0.5):
        """An elastic tween function wobbles towards the midpoint.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n *= 2
        if n < 1:
            return Ease.InElastic(n, amplitude=amplitude, period=period) / 2
        else:
            return Ease.OutElastic(n - 1, amplitude=amplitude, period=period) / 2 + 0.5

    @staticmethod
    def InBack(n, s=1.70158):
        """A tween function that backs up first at the start and then goes to the destination.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return n * n * ((s + 1) * n - s)

    @staticmethod
    def OutBack(n, s=1.70158):
        """A tween function that overshoots the destination a little and then backs into the destination.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = n - 1
        return n * n * ((s + 1) * n + s) + 1

    @staticmethod
    def InOutBack(n, s=1.70158):
        """A "back-in" tween function that overshoots both the start and destination.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        n = n * 2
        if n < 1:
            s *= 1.525
            return 0.5 * (n * n * ((s + 1) * n - s))
        else:
            n -= 2
            s *= 1.525
            return 0.5 * (n * n * ((s + 1) * n + s) + 2)

    @staticmethod
    def InBounce(n):
        """A bouncing tween function that begins bouncing and then jumps to the destination.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        return 1 - Ease.OutBounce(1 - n)

    @staticmethod
    def OutBounce(n):
        """A bouncing tween function that hits the destination and then bounces to rest.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        if n < (1 / 2.75):
            return 7.5625 * n * n
        elif n < (2 / 2.75):
            n -= 1.5 / 2.75
            return 7.5625 * n * n + 0.75
        elif n < (2.5 / 2.75):
            n -= 2.25 / 2.75
            return 7.5625 * n * n + 0.9375
        else:
            n -= 2.65 / 2.75
            return 7.5625 * n * n + 0.984375

    @staticmethod
    def InOutBounce(n):
        """A bouncing tween function that bounces at the start and end.

        Args:
        n (float): The time progress, starting at 0.0 and ending at 1.0.

        Returns:
        (float) The line progress, starting at 0.0 and ending at 1.0. Suitable for passing to getPointOnLine().
        """
        Ease._checkRange(n)
        if n < 0.5:
            return Ease.InBounce(n * 2) * 0.5
        else:
            return Ease.OutBounce(n * 2 - 1) * 0.5 + 0.5


class Tween:
    def __init__(
        self,
        hass: HomeAssistant,
        service: Callable[[Entity, Any], None],
        entity: Entity,
        entity_id: str,
        factor: float,
        sprops,
        eprops,
        duration: float,
        offset: float,
        ease: Callable[[float], float],
        delay: float,
        loop: int,
        loopDelay: float,
    ):
        self._valid = False
        self.hass = hass
        self.service = service
        self.entity = entity
        self.entity_id: str = entity_id
        self.duration: float = duration if duration > 0 else 0.001
        self.offset: float = offset if None != offset else 0
        self.factor: float = clamp(factor * self.offset / self.duration, 0, 1)
        self.ease: Callable[[float], float] = ease
        self.delay: float = delay if None != delay else 0
        self.loop: int = loop if None != loop else 1
        self.loopDelay: float = loopDelay if None != loopDelay else 0
        if None == ease or None == getattr(Ease, ease):
            self.ease = Ease.OutSine
        else:
            self.ease = getattr(Ease, ease)

        self.state = "NONE"
        self.elapsed: float = 0
        self.progress: float = 0
        self.loopCounter: int = 0

        currState: State = self.hass.states.get(self.entity_id)
        if None == currState:
            return

        if None == sprops:
            sprops = {}

        for key in eprops:
            if None == sprops.get(key):
                sprops[key] = currState.attributes.get(key)
                if None == sprops[key]:
                    sprops[key] = 0.0
                if type(sprops[key]) is tuple:
                    sprops[key] = list(sprops[key])

            if type(eprops[key]) is list:
                if type(sprops[key]) is not list:
                    del eprops[key]
                else:
                    slen = len(sprops[key])
                    elen = len(eprops[key])
                    if elen > slen:
                        eprops[key] = eprops[key][: slen - elen]
                    else:
                        if slen > elen:
                            eprops[key].append(sprops[key][elen:])

        self.sprops = sprops
        self.cprops = {}
        self.eprops = eprops
        self.setCurrent(0)
        self._valid = True

    @property
    def valid(self):
        return self._valid

    def Start(self):
        if self.delay > 0:
            self.elapsed = -self.delay
            self.state = "DELAY"
        else:
            self.elapsed = 0
            self.state = "PLAY"

    def onEnded(self):
        self.entity.async_write_ha_state()
        return True

    def setCurrent(self, progress: float):
        progress = clamp(self.ease(progress), 0, 1)
        f = fract(progress + self.factor)
        for key in self.eprops:
            self.cprops[key] = self.setProp(self.sprops[key], self.eprops[key], f)

    def setProp(self, s, e, progress: float):
        if type(e) is float or type(e) is int:
            return clamp(s * (1 - progress) + e * progress, s, e)
        if type(e) is list:
            res = []
            for i in range(len(e)):
                a = clamp(s[i] * (1 - progress) + e[i] * progress, s[i], e[i])
                res.append(a)
            return res

        return None

    def setState(self):
        self.service(self.entity, self.cprops)

    def toCurrent(self):
        self.setCurrent(self.progress)
        self.setState()

    def toEnd(self):
        self.setCurrent(1)
        self.setState()

    def onTick(self, elapse: float):
        if self.state == "END":
            return True

        elapsed: float = self.elapsed
        duration: float = self.duration
        diff: float = 0

        elapsed += elapse
        if elapsed > duration:
            diff = elapsed - duration
            elapsed = duration

        progress: float = elapsed / duration
        self.progress = progress
        self.elapsed = elapsed

        if self.state == "DELAY":
            if elapsed < 0:
                return False
            self.state = "PLAY"

        if self.state != "PLAY":
            return False

        if 1 == progress:
            self.toEnd()
            if self.loop > 0:
                self.loopCounter += 1
                if self.loopCounter >= self.loop:
                    self.state = "END"
                    return self.onEnded()

            self.elapsed = diff
            if self.loopDelay > 0:
                self.elapsed -= self.loopDelay
                self.state = "DELAY"
            return self.onTick(0)

        self.toCurrent()
        return False
