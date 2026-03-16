plugins {
    java
    id("com.github.johnrengelman.shadow") version "8.1.1"
}

version = "1.0.0"
group = "com.mts.stratos"

// Micronaut 4.6.x BOM — manages all io.micronaut.* dependency versions
val micronautVersion = "4.6.3"

repositories {
    mavenCentral()
}

dependencies {
    // ── Micronaut BOM ─────────────────────────────────────────────────────────
    //  Apply to both implementation and annotationProcessor configs so all
    //  Micronaut artifacts get consistent, compatible versions.
    implementation(platform("io.micronaut.platform:micronaut-platform:$micronautVersion"))
    annotationProcessor(platform("io.micronaut.platform:micronaut-platform:$micronautVersion"))

    // ── Annotation processors ────────────────────────────────────────────────
    annotationProcessor("io.micronaut:micronaut-http-validation")
    annotationProcessor("io.micronaut.serde:micronaut-serde-processor")
    annotationProcessor("io.micronaut:micronaut-inject-java")

    // Lombok (declare before other APs so it runs first)
    compileOnly("org.projectlombok:lombok:1.18.32")
    annotationProcessor("org.projectlombok:lombok:1.18.32")

    // ── HTTP server ───────────────────────────────────────────────────────────
    implementation("io.micronaut:micronaut-http-server-netty")
    implementation("io.micronaut.serde:micronaut-serde-jackson")

    // ── Database — raw JDBC via HikariCP (mirrors Node.js pg pattern) ─────────
    implementation("io.micronaut.sql:micronaut-jdbc-hikari")
    runtimeOnly("org.postgresql:postgresql:42.7.3")

    // ── Redis — Lettuce core (manual factory in RedisConfig.java)
    // We use lettuce-core directly (not micronaut-redis-lettuce) to configure
    // DnsResolvers.JVM_DEFAULT, which avoids the Netty async DNS hang on Alpine.
    implementation("io.lettuce:lettuce-core")

    // ── JWT — HS256 compatible with Node.js jsonwebtoken ─────────────────────
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // ── BCrypt — compatible with bcryptjs $2b$ hashes ─────────────────────────
    implementation("at.favre.lib:bcrypt:0.10.2")

    // ── Jackson (versions managed by BOM) ────────────────────────────────────
    implementation("com.fasterxml.jackson.core:jackson-databind")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310")

    // ── Logging ───────────────────────────────────────────────────────────────
    runtimeOnly("ch.qos.logback:logback-classic")

    // ─────────────────────────────────────────────────────────────────────────
    // SDP SDK — Phase 3.6b (live market data)
    // Uncomment when sdp-protocol and sdp-client JARs are available from:
    //   https://artifactory.oad.exch.int/artifactory/mts-software-factory-maven-release-dev-local/
    // ─────────────────────────────────────────────────────────────────────────
    // implementation("com.mtsmarkets:sdp-protocol:5.0.1")
    // implementation("com.mtsmarkets:sdp-client:5.0.1")
    // sdp-bvf JAR is loaded at runtime via URLClassLoader (not a compile dep)
    // ─────────────────────────────────────────────────────────────────────────
}

java {
    sourceCompatibility = JavaVersion.VERSION_21
    targetCompatibility = JavaVersion.VERSION_21
}

// Micronaut requires method parameter names to be retained at runtime
tasks.withType<JavaCompile>().configureEach {
    options.compilerArgs.add("-parameters")
}

// Fat / uber JAR via Shadow — the artefact the Dockerfile copies
tasks.withType<com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar> {
    archiveClassifier.set("all")
    mergeServiceFiles()   // required for Micronaut service loader files
    manifest {
        attributes("Main-Class" to "com.mts.stratos.Application")
    }
}

// Disable the plain thin JAR — Docker only needs the shadow fat JAR
tasks.named<Jar>("jar") {
    enabled = false
}
