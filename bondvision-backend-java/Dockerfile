# ── Runtime image ─────────────────────────────────────────────────────────────
#
# Docker Desktop for Windows uses a separate virtual network (Hyper-V/WSL2) that
# bypasses the corporate VPN tunnel on the host. Combined with FortiVPN SSL
# inspection, Maven Central / Gradle Plugin Portal are unreachable from inside
# Docker containers.
#
# Build strategy: compile on the host (where VPN routes correctly), then copy
# the fat JAR into the runtime image. Rebuild with:
#
#   .\build-and-deploy.ps1
#
# or manually:
#   gradle shadowJar --no-daemon    (requires Gradle 8.8 + Java 21 on PATH)
#   docker-compose -f docker-compose.master.yml -f docker-compose.java-backend.yml up --build -d
#
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the pre-built shadow fat JAR (produced by: gradle shadowJar)
COPY build/libs/bondvision-backend-java-*-all.jar app.jar

# Local JARs loaded dynamically at runtime (sdp-bvf, future SDP JARs — Phase 3.6b)
COPY libs/ libs/
# BV class metadata
COPY config/ config/

# NOTE: certs/ is intentionally NOT copied — mounted as a read-only volume
# in docker-compose so the certificate never lives in the image layer.

EXPOSE 3001

ENTRYPOINT ["java", "-jar", "app.jar"]
