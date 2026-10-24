package com.skimry.skimry.security;

import com.skimry.skimry.entity.User;
import com.skimry.skimry.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(
            JwtUtil jwtUtil,
            UserRepository userRepository) {

        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = getTokenCookie(request);

        if (jwt != null
                && SecurityContextHolder
                .getContext()
                .getAuthentication() == null
                && jwtUtil.validateToken(jwt)) {

            try {
                UUID userId = jwtUtil.getUserIdFromToken(jwt);

                User user = userRepository.findById(userId)
                        .orElse(null);

                if (user != null) {
                    AuthenticatedUser authenticatedUser =
                            new AuthenticatedUser(
                                    user.getUserId(),
                                    user.getEmail()
                            );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    authenticatedUser,
                                    null,
                                    authenticatedUser.getAuthorities()
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(authentication);
                }

            } catch (IllegalArgumentException exception) {
                // Invalid or legacy JWT without a valid userId claim.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getTokenCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if ("token".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }

        return null;
    }
}
