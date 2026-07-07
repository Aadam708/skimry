package com.skimry.skimry.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    // Injecting my jwtutil and userdetails service
    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String username = null;
        String jwt = null;

        // my jwt stored in http cookie for security
        if (jwt == null && request.getCookies() != null) {

            for(Cookie cookie: request.getCookies()){

                if("token".equals(cookie.getName())){
                    jwt = cookie.getValue();
                    break;
                }
            }
        }

        // If we found a username and the user isn't already authenticated in this request session
        if (jwt != null && SecurityContextHolder.getContext().getAuthentication() == null) {


            // Validate the token against the key and structural parameters
            if (jwtUtil.validateToken(jwt)) {
                username = jwtUtil.getUsernameFromToken(jwt);
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Hand the user details over to the SecurityContextHolder context shield
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Pass the request down the pipeline to the controllers
        filterChain.doFilter(request, response);
    }
}
