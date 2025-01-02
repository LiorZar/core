# Specify the base image for ARMv7
ARG BUILD_FROM=ghcr.io/home-assistant/armv7-base:latest
FROM ${BUILD_FROM}

# Set environment variables
ENV \
    S6_SERVICES_GRACETIME=240000 \
    UV_SYSTEM_PYTHON=true

# Install QEMU for ARM support (if needed)
ARG QEMU_CPU

# Install UV
RUN pip3 install uv==0.2.13

# Set working directory
WORKDIR /usr/src

# Setup Home Assistant Core dependencies
COPY requirements.txt homeassistant/
COPY homeassistant/package_constraints.txt homeassistant/homeassistant/
RUN \
    uv pip install \
        --no-build \
        -r homeassistant/requirements.txt

COPY requirements_all.txt home_assistant_frontend-* home_assistant_intents-* homeassistant/
RUN \
    if ls homeassistant/home_assistant_*.whl 1> /dev/null 2>&1; then \
        uv pip install homeassistant/home_assistant_*.whl; \
    fi \
    && if [ "${BUILD_ARCH}" = "i386" ]; then \
        linux32 uv pip install \
            --no-build \
            -r homeassistant/requirements_all.txt; \
    else \
        uv pip install \
            --no-build \
            -r homeassistant/requirements_all.txt; \
    fi

# Setup Home Assistant Core
COPY . homeassistant/
RUN \
    uv pip install \
        -e ./homeassistant \
    && python3 -m compileall \
        homeassistant/homeassistant

# Home Assistant S6-Overlay
COPY rootfs /

# Final working directory
WORKDIR /config