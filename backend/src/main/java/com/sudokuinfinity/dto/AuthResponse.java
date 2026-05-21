package com.sudokuinfinity.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    public String token;
    public String refreshToken;
    public UserDTO user;
}
