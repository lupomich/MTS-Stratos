package com.mts.stratos.users.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private Boolean is_active;
    private String role;
    private String password;
}
