package com.nesthub.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

@Service
public class GoogleIdentityService {
    private final String clientId;
    private final JwtDecoder decoder;

    public GoogleIdentityService(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId;
        NimbusJwtDecoder google = NimbusJwtDecoder
                .withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build();
        google.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                token -> {
                    String issuer = token.getClaimAsString("iss");
                    boolean valid = ("https://accounts.google.com".equals(issuer)
                            || "accounts.google.com".equals(issuer))
                            && token.getAudience().contains(clientId)
                            && token.getExpiresAt() != null
                            && token.getSubject() != null
                            && Boolean.TRUE.equals(token.getClaimAsBoolean("email_verified"))
                            && token.getClaimAsString("email") != null;
                    return valid ? OAuth2TokenValidatorResult.success()
                            : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token"));
                }));
        this.decoder = google;
    }

    public Jwt verify(String credential) {
        if (clientId.isBlank()) {
            throw new IllegalArgumentException("Google sign-in is not configured yet. Please use email and password.");
        }
        try {
            return decoder.decode(credential);
        } catch (JwtException ex) {
            throw new IllegalArgumentException("Google sign-in could not be verified. Please try again.");
        }
    }
}
