package com.mts.stratos.health;

import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

import java.util.Map;

@Controller("/api")
public class HealthController {

    @Get("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }
}
