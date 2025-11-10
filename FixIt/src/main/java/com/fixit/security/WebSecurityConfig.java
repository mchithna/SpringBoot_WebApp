package com.fixit.security;

import com.fixit.service.UserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class WebSecurityConfig {

    private final JwtRequestFilter jwtRequestFilter;

    public WebSecurityConfig(@Lazy UserService userService, JwtRequestFilter jwtRequestFilter) {
        this.jwtRequestFilter = jwtRequestFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // --- MODIFIED: Added permissions for root static files ---
                        .requestMatchers(
                                "/", "/*.html", "/*.js", "/*.css", "/*.ico", // Allow root files
                                "/static/**", // Allow files in /static/ (for dashboards)
                                "/uploads/**" // Allow image uploads
                        ).permitAll()

                        // --- Public API Endpoints ---
                        .requestMatchers("/api/auth/register", "/api/providers/register").permitAll()
                        .requestMatchers("/api/auth/login", "/api/admin/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/providers/**", "/api/reviews/provider/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/services/categories").permitAll()
                        .requestMatchers("/api/contact").permitAll()

                        // --- Secured Endpoints (by Role) ---
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/providers/dashboard/**", "/api/providers/services/**").hasRole("PROVIDER")
                        .requestMatchers("/api/users/**", "/api/bookings/**", "/api/reviews/**", "/api/favorites/**").hasRole("CUSTOMER")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Cache-Control", "Content-Type"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}