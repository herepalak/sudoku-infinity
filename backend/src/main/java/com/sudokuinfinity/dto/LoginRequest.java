package com.sudokuinfinity.dto;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {
    @NotBlank public String usernameOrEmail;
    @NotBlank public String password;
}
