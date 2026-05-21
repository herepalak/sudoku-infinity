package com.sudokuinfinity.service;

import com.sudokuinfinity.dto.*;
import com.sudokuinfinity.entity.User;
import com.sudokuinfinity.repository.UserRepository;
import com.sudokuinfinity.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername()))
            throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");

        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .displayName(req.getDisplayName() != null ? req.getDisplayName() : req.getUsername())
            .build();
        userRepository.save(user);

        UserDetails ud = userDetailsService.loadUserByUsername(user.getUsername());
        return AuthResponse.builder()
            .token(jwtUtil.generateToken(ud))
            .refreshToken(jwtUtil.generateRefreshToken(ud))
            .user(toUserDTO(user))
            .build();
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getUsernameOrEmail(), req.getPassword()));
        User user = userRepository.findByUsername(req.getUsernameOrEmail())
            .or(() -> userRepository.findByEmail(req.getUsernameOrEmail()))
            .orElseThrow();
        UserDetails ud = userDetailsService.loadUserByUsername(user.getUsername());
        return AuthResponse.builder()
            .token(jwtUtil.generateToken(ud))
            .refreshToken(jwtUtil.generateRefreshToken(ud))
            .user(toUserDTO(user))
            .build();
    }

    public UserDTO getProfile(String username) {
        User user = userRepository.findByUsername(username).orElseThrow();
        return toUserDTO(user);
    }

    public static UserDTO toUserDTO(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .displayName(user.getDisplayName())
            .avatarUrl(user.getAvatarUrl())
            .xpPoints(user.getXpPoints())
            .level(user.getLevel())
            .currentStreak(user.getCurrentStreak())
            .longestStreak(user.getLongestStreak())
            .totalPuzzlesSolved(user.getTotalPuzzlesSolved())
            .preferredTheme(user.getPreferredTheme())
            .preferredDifficulty(user.getPreferredDifficulty())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
