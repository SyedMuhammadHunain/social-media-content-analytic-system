package com.social.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origin-patterns:${ALLOWED_ORIGIN_PATTERNS:}}")
    private String customOriginPatterns;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);

        List<String> origins = new ArrayList<>(List.of(
            "http://localhost:[*]",
            "http://127.0.0.1:[*]",
            "https://*.vercel.app",
            "https://vercel.app"
        ));

        if (StringUtils.hasText(customOriginPatterns)) {
            Arrays.stream(customOriginPatterns.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .forEach(origins::add);
        }

        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}
