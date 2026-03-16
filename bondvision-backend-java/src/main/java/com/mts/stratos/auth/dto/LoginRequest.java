package com.mts.stratos.auth.dto;

import io.micronaut.core.annotation.Introspected;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Data;

@Data
@Introspected
@Serdeable
public class LoginRequest {
    private String username;
    private String password;
}
