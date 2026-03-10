/*package com.inkspire.inkspire.config;

import com.inkspire.inkspire.service.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;

import java.io.PrintWriter;
import java.io.StringWriter;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.SecurityFilterChain;



@Configuration
@EnableWebSecurity
public class OAuth2Config {
    private static final Logger logger = LoggerFactory.getLogger(OAuth2Config.class);
    
    private final UserService userService;

    public OAuth2Config(UserService userService) {
        this.userService = userService;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz
                .requestMatchers(
                    "/", "/api", "/error", "/webjars/**", "/api/auth/**", "/login", "/login/oauth2/**", 
                    "/static/**", "/index.html", "/*.js", "/*.css", "/*.json", "/favicon.ico", "/*.png", 
                    "/*.jpg", "/*.jpeg", "/*.gif", "/css/**", "/js/**", "/images/**"
                ).permitAll()
                .anyRequest().authenticated())
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll())
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/login")
                .authorizationEndpoint(authz -> authz
                    .baseUri("/login/oauth2/authorization")
                    .authorizationRequestRepository(new HttpSessionOAuth2AuthorizationRequestRepository()))
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/login/oauth2/code/*"))
                .defaultSuccessUrl("/", true)
                .failureUrl("/login?error=true")
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(oauth2UserService()))
                .failureHandler((request, response, exception) -> {
                    // Log detailed error information
                    logger.error("OAuth2 Authentication Failure", exception);
                    
                    // Log request parameters
                    logger.error("Request Parameters:");
                    request.getParameterMap().forEach((key, values) -> 
                        logger.error("{}: {}", key, String.join(", ", values)));
                    
                    // Log request headers
                    logger.error("Request Headers:");
                    var headerNames = request.getHeaderNames();
                    while (headerNames.hasMoreElements()) {
                        String headerName = headerNames.nextElement();
                        try {
                            String headerValue = request.getHeader(headerName);
                            logger.error("{}: {}", headerName, 
                                headerName.toLowerCase().contains("authorization") ? 
                                "[REDACTED]" : headerValue);
                        } catch (Exception e) {
                            logger.error("Error reading header {}: {}", headerName, e.getMessage());
                        }
                    }
                    
                    // Log additional request details
                    logger.error("Request URL: {}", request.getRequestURL());
                    logger.error("Request Method: {}", request.getMethod());
                    logger.error("Query String: {}", request.getQueryString());
                    logger.error("Remote Address: {}", request.getRemoteAddr());
                    logger.error("Protocol: {}", request.getProtocol());
                    
                    // Detailed exception logging
                    if (exception != null) {
                        logger.error("Exception Type: {}", exception.getClass().getName());
                        logger.error("Exception Message: {}", exception.getMessage());
                        
                        // Log stack trace
                        StringWriter sw = new StringWriter();
                        PrintWriter pw = new PrintWriter(sw);
                        exception.printStackTrace(pw);
                        logger.error("Full Stack Trace:\n{}", sw.toString());
                        // Send detailed error response
                        response.setStatus(401); // Unauthorized
                        response.setContentType("application/json");
                        response.getWriter().write(String.format("{\"error\": \"Authentication Failed\", \"message\": \"%s\"}", 
                            exception != null ? exception.getMessage() : "Unknown authentication error"));
                    }
                }))
            .logout(logout -> logout
                .logoutSuccessUrl("/login").permitAll());
        return http.build();
    }
    
    @Bean
    public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        logger.info("Initializing OAuth2 User Service");
        DefaultOAuth2UserService delegate = new DefaultOAuth2UserService();
        
        return request -> {
            OAuth2User oauth2User = delegate.loadUser(request);
            
            logger.info("OAuth2 User Loaded: {}", oauth2User.getName());
            
            return oauth2User;
        };
    }
} */