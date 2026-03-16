package com.mts.stratos.config;

import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.StringCodec;
import io.lettuce.core.resource.ClientResources;
import io.lettuce.core.resource.DefaultClientResources;
import io.lettuce.core.resource.DnsResolvers;
import io.micronaut.context.annotation.Factory;
import io.micronaut.context.annotation.Value;
import jakarta.annotation.PreDestroy;
import jakarta.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Manual Lettuce Redis factory.
 *
 * Micronaut's built-in micronaut-redis-lettuce uses Netty's async DNS resolver
 * which hangs inside Alpine Docker containers (musl libc incompatibility).
 * This factory explicitly sets DnsResolvers.JVM_DEFAULT to use the standard
 * JVM InetAddress resolver (which respects /etc/resolv.conf correctly in Docker).
 */
@Factory
public class RedisConfig {

    private static final Logger log = LoggerFactory.getLogger(RedisConfig.class);

    private ClientResources clientResources;
    private RedisClient redisClient;
    private StatefulRedisConnection<String, String> connection;

    @Singleton
    public StatefulRedisConnection<String, String> redisConnection(
            @Value("${redis.uri:redis://localhost:6379}") String redisUri) {

        log.info("Connecting to Redis: {}", redisUri);

        clientResources = DefaultClientResources.builder()
                .dnsResolver(DnsResolvers.JVM_DEFAULT)
                .build();

        redisClient = RedisClient.create(clientResources, RedisURI.create(redisUri));
        connection  = redisClient.connect(StringCodec.UTF8);

        log.info("Redis connection established");
        return connection;
    }

    @PreDestroy
    public void shutdown() {
        try { if (connection   != null) connection.close();   } catch (Exception ignored) {}
        try { if (redisClient  != null) redisClient.shutdown(); } catch (Exception ignored) {}
        try { if (clientResources != null) clientResources.shutdown(); } catch (Exception ignored) {}
    }
}
