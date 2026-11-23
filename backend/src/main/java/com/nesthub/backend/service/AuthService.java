package com.nesthub.backend.service;

import com.nesthub.backend.dto.AuthResponse;
import com.nesthub.backend.dto.LoginRequest;
import com.nesthub.backend.dto.GoogleLoginRequest;
import com.nesthub.backend.dto.RegisterRequest;
import com.nesthub.backend.entity.Role;
import com.nesthub.backend.entity.User;
import com.nesthub.backend.repository.UserRepository;
import com.nesthub.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final GoogleIdentityService googleIdentityService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService, GoogleIdentityService googleIdentityService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleIdentityService = googleIdentityService;
    }

    // Self-registration is owner-only. An owner is the root of the hierarchy - nobody invites them.
    // Managers, maintenance, and tenants are created from inside a dashboard (see UserController),
    // never through this endpoint.
    public AuthResponse register(RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }
        User user = new User();
        user.setFullName(request.fullName());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.owner);
        userRepository.save(user);
        return toAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("Incorrect email or password."));
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect email or password.");
        }
        return toAuthResponse(user);
    }

    private AuthResponse toAuthResponse(User user) {
        String token = jwtService.generateToken(user.getId(), user.getRole().name());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }

    @org.springframework.transaction.annotation.Transactional
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        if (!"staff".equals(request.portal())) {
            throw new IllegalArgumentException("Google sign-in is only available in the property portal. Tenants must use email and password.");
        }
        var identity = googleIdentityService.verify(request.credential());
        String email = identity.getClaimAsString("email").toLowerCase(java.util.Locale.ROOT);
        String subject = identity.getSubject();
        User user = userRepository.findByGoogleSubject(subject).orElse(null);
        if (user == null) {
            // Only Google-controlled mailboxes can securely link a pre-existing email account.
            boolean authoritativeEmail = email.endsWith("@gmail.com")
                    || identity.getClaimAsString("hd") != null;
            User existing = userRepository.findByEmailIgnoreCase(email).orElse(null);
            if (existing != null) {
                if (!authoritativeEmail || (existing.getGoogleSubject() != null
                        && !subject.equals(existing.getGoogleSubject()))) {
                    throw new IllegalArgumentException("Use your email and password to access this account.");
                }
                user = existing;
            } else {
                if (!request.register() || !"staff".equals(request.portal())) {
                    throw new IllegalArgumentException("No account exists for this Google email. Ask your property team to create one, or register as an owner.");
                }
                user = new User();
                user.setEmail(email);
                String name = identity.getClaimAsString("name");
                user.setFullName(name == null || name.isBlank() ? email : name);
                user.setRole(Role.owner);
                user.setPasswordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            }
            user.setGoogleSubject(subject);
        }
        if (user.getRole() == Role.tenant) {
            throw new IllegalArgumentException("Tenant accounts must sign in with email and password in the tenant portal.");
        }
        userRepository.save(user);
        return toAuthResponse(user);
    }
}
