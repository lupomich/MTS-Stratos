package com.mts.stratos.security;

import io.micronaut.context.annotation.Value;
import io.micronaut.core.async.publisher.Publishers;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.Filter;
import io.micronaut.http.filter.HttpServerFilter;
import io.micronaut.http.filter.ServerFilterChain;
import jakarta.inject.Singleton;
import org.reactivestreams.Publisher;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * CORS filter — mirrors Node.js Express cors() configuration exactly.
 *
 * Allowed origins: localhost:3002, bondvision-digital:3002, and optional CORS_ORIGIN env var.
 */
@Singleton
@Filter("/**")
public class CorsFilter implements HttpServerFilter {

    private final List<String> allowedOrigins;

    public CorsFilter(@Value("${app.cors-origin:}") String corsOriginEnv) {
        this.allowedOrigins = Stream.concat(
                Stream.of("http://localhost:3002", "http://bondvision-digital:3002"),
                corsOriginEnv.isBlank() ? Stream.empty() : Stream.of(corsOriginEnv.trim()))
                .collect(Collectors.toList());
    }

    @Override
    public Publisher<MutableHttpResponse<?>> doFilter(HttpRequest<?> request, ServerFilterChain chain) {
        String origin = request.getHeaders().getOrigin().orElse(null);

        // Preflight request
        if ("OPTIONS".equalsIgnoreCase(request.getMethodName()) && origin != null) {
            MutableHttpResponse<?> preflight = HttpResponse.ok();
            applyCorsHeaders(preflight, origin);
            return Publishers.just(preflight);
        }

        return Publishers.map(chain.proceed(request), response -> {
            if (origin != null) {
                applyCorsHeaders(response, origin);
            }
            return response;
        });
    }

    private void applyCorsHeaders(MutableHttpResponse<?> response, String origin) {
        if (origin == null) return;
        if (allowedOrigins.contains(origin)) {
            response.header("Access-Control-Allow-Origin", origin);
            response.header("Access-Control-Allow-Credentials", "true");
            response.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
            response.header("Access-Control-Allow-Headers", "Authorization,Content-Type");
        }
    }

    @Override
    public int getOrder() {
        return Integer.MIN_VALUE; // run first
    }
}
