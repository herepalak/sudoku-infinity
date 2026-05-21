package com.sudokuinfinity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@SuppressWarnings("unused")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {
    @NotBlank @Size(min=3, max=50) public String username;
    @NotBlank @Email                public String email;
    @NotBlank @Size(min=6)          public String password;
    public String displayName;
}
