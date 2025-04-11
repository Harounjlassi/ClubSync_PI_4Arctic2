package tn.esprit.clubsync.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    // 🔹 Injection du filtre JWT via le constructeur
    public SecurityConfig(@Lazy JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())  // 🔥 Désactiver CSRF (utile pour les API REST)
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // 🔹 Activation CORS
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // 🔥 Mode stateless
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/registration",
                                "/auth/login",
                                "/auth/send-verification-code",
                                "/auth/verify-code",
                                "/auth/me",
                                "/error",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/auth/token/{email}",
                                "/user/update/{id}",
                                "/user/delete/{id}",
                                "/reclamations/**",
                                "/user/archive/{id}",
                                "/user/restore/{id}",
                                "/user/get/{id}",
                                "/user/get/all",
                                "/user/filter",
                                "/user/users/sorted",
                                "/auth/User",
                                "/auth/Admin", // 👈 ajoute ceci si tu veux le rendre public temporairement
                                "/auth/logout",
                                "/user/users/stats"
                        ).permitAll()  //  Routes accessibles sans authentification
                        .anyRequest().authenticated() //  Sécuriser toutes les autres routes
                )
                .authenticationProvider(authenticationProvider()) // 🔹 Utilisation de l'authenticationProvider
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class) // 🔥 Ajout du filtre JWT ici
                .build();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return new UserInfoUserDetailsService();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();
        daoAuthenticationProvider.setUserDetailsService(userDetailsService());
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        return daoAuthenticationProvider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // 🔥 CORS configuration update to allow only specific origin (e.g., localhost:4200)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:4200")); // Change "*" to specific origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); // Allow sending credentials (cookies, tokens)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Swagger config for Bearer authentication (JWT)
    @Configuration
    @SecurityScheme(
            name = "BearerAuth",
            type = SecuritySchemeType.HTTP,
            scheme = "bearer",
            bearerFormat = "JWT"
    )
    public class SwaggerConfig {
    }
}
