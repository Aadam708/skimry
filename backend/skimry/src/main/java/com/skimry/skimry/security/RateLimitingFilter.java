package com.skimry.skimry.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpMethod;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;


import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> authBuckets =
            new ConcurrentHashMap<>();

    private final Map<String, Bucket> summaryBuckets =
            new ConcurrentHashMap<>();

    private final RequestMatcher authMatcher =
            PathPatternRequestMatcher.withDefaults()
                    .matcher(HttpMethod.POST, "/api/auth/**");

    private final RequestMatcher summaryMatcher =
            PathPatternRequestMatcher.withDefaults()
                    .matcher(HttpMethod.POST, "/api/materials/upload");

    private final RequestMatcher materialsMatcher =
            PathPatternRequestMatcher.withDefaults()
                    .matcher(HttpMethod.GET, "/api/materials/my");

    private Bucket createAuthBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket createSummaryBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillGreedy(10, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIP(request);

        if (authMatcher.matches(request)) {
            Bucket bucket = authBuckets.computeIfAbsent(
                    clientIp,
                    key -> createAuthBucket()
            );

            if (!bucket.tryConsume(1)) {
                sendRateLimitResponse(response);
                return;
            }
        }

        if (summaryMatcher.matches(request)
                || materialsMatcher.matches(request)) {

            Bucket bucket = summaryBuckets.computeIfAbsent(
                    clientIp,
                    key -> createSummaryBucket()
            );

            if (!bucket.tryConsume(1)) {
                sendRateLimitResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void sendRateLimitResponse(HttpServletResponse response)
            throws IOException {

        response.setStatus(429);//429 too many requests
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", "60");

        response.getWriter().write(
                "{\"error\":\"Too many summary requests. Please try again later.\"}"
        );
    }

    private String getClientIP(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");

        if (forwardedFor == null || forwardedFor.isBlank()) {
            return request.getRemoteAddr();
        }

        return forwardedFor.split(",")[0].trim();
    }
}
