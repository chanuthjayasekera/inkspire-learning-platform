package com.inkspire.inkspire.controller;

import com.inkspire.inkspire.model.User;
import com.inkspire.inkspire.model.UserFollow;
import com.inkspire.inkspire.payload.AuthResponse;
import com.inkspire.inkspire.payload.LoginRequest;
import com.inkspire.inkspire.payload.SignupRequest;
import com.inkspire.inkspire.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            User user = new User();
            user.setName(signupRequest.getName());
            user.setEmail(signupRequest.getEmail());
            user.setPhoneNumber(signupRequest.getPhoneNumber());
            user.setPassword(signupRequest.getPassword());

            User registeredUser = userService.registerUser(user);
            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully",
                    "userId", registeredUser.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String token = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());
            User user = userService.getUserByEmail(loginRequest.getEmail());

            AuthResponse response = new AuthResponse();
            response.setToken(token);
            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setPhoneNumber(user.getPhoneNumber());
            response.setType("Bearer");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and newPassword are required"));
        }

        boolean success = userService.resetPassword(email, newPassword);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Password reset successful"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
        }
    }

    @GetMapping("/google-user")
    public ResponseEntity<?> getGoogleUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User oauthUser) {
            Map<String, Object> attributes = oauthUser.getAttributes();
            return ResponseEntity.ok(attributes);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            User user = userService.getUserByEmail(userDetails.getUsername());
            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phoneNumber", user.getPhoneNumber()
            ));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/profile")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            logger.info("Received profile update request: {}", request);

            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not authenticated"));
            }

            User user;
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                user = userService.getUserByEmail(userDetails.getUsername());
            } else if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                String email = (String) oauth2User.getAttributes().get("email");
                user = userService.getUserByEmail(email);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unsupported authentication type"));
            }

            String name = request.get("name");
            String phoneNumber = request.get("phoneNumber");

            // Validate input
            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Name is required"));
            }
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number is required"));
            }

            // Update user
            user.setName(name.trim());
            user.setPhoneNumber(phoneNumber.trim());
            userService.updateUser(user);

            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("profileImage", user.getProfileImage());
            response.put("message", "Profile updated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error updating profile: ", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/followers")
    public ResponseEntity<?> getFollowers(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request for followers");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            User user;
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                user = userService.getUserByEmail(userDetails.getUsername());
            } else if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                String email = (String) oauth2User.getAttributes().get("email");
                user = userService.getUserByEmail(email);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unsupported authentication type"));
            }

            logger.debug("Fetching followers for user with email: {}", user.getEmail());
            List<User> followers = user.getFollowers().stream()
                    .map(UserFollow::getFollower)
                    .collect(Collectors.toList());
            List<Map<String, Object>> followerDTOs = followers.stream()
                    .map(follower -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", follower.getId());
                        dto.put("name", follower.getName());
                        dto.put("profileImage", follower.getProfileImage());
                        return dto;
                    })
                    .collect(Collectors.toList());
            logger.info("Retrieved {} followers for user {}", followerDTOs.size(), user.getId());
            return ResponseEntity.ok(followerDTOs);
        } catch (Exception e) {
            logger.error("Error fetching followers: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch followers: " + e.getMessage()));
        }
    }

    @GetMapping("/following")
    public ResponseEntity<?> getFollowing(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request for following");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            User user;
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                user = userService.getUserByEmail(userDetails.getUsername());
            } else if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                String email = (String) oauth2User.getAttributes().get("email");
                user = userService.getUserByEmail(email);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unsupported authentication type"));
            }

            logger.debug("Fetching following for user with email: {}", user.getEmail());
            List<User> following = user.getFollowing().stream()
                    .map(UserFollow::getFollowee)
                    .collect(Collectors.toList());
            List<Map<String, Object>> followingDTOs = following.stream()
                    .map(followee -> {
                        Map<String, Object> dto = new HashMap<>();
                        dto.put("id", followee.getId());
                        dto.put("name", followee.getName());
                        dto.put("profileImage", followee.getProfileImage());
                        return dto;
                    })
                    .collect(Collectors.toList());
            logger.info("Retrieved {} following for user {}", followingDTOs.size(), user.getId());
            return ResponseEntity.ok(followingDTOs);
        } catch (Exception e) {
            logger.error("Error fetching following: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch following: " + e.getMessage()));
        }
    }

    @PostMapping("/follow/{userId}")
    public ResponseEntity<?> followUser(@PathVariable Long userId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to follow user: {}", userId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            User user;
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                user = userService.getUserByEmail(userDetails.getUsername());
            } else if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                String email = (String) oauth2User.getAttributes().get("email");
                user = userService.getUserByEmail(email);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unsupported authentication type"));
            }

            if (user.getId().equals(userId)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot follow yourself"));
            }

            userService.followUser(user.getId(), userId);
            logger.info("User {} followed user {}", user.getId(), userId);
            return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
        } catch (Exception e) {
            logger.error("Error following user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to follow user: " + e.getMessage()));
        }
    }

    @PostMapping("/unfollow/{userId}")
    public ResponseEntity<?> unfollowUser(@PathVariable Long userId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("Unauthenticated request to unfollow user: {}", userId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Authentication required"));
            }

            User user;
            if (authentication.getPrincipal() instanceof UserDetails userDetails) {
                user = userService.getUserByEmail(userDetails.getUsername());
            } else if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                String email = (String) oauth2User.getAttributes().get("email");
                user = userService.getUserByEmail(email);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unsupported authentication type"));
            }

            userService.unfollowUser(user.getId(), userId);
            logger.info("User {} unfollowed user {}", user.getId(), userId);
            return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
        } catch (Exception e) {
            logger.error("Error unfollowing user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to unfollow user: " + e.getMessage()));
        }
    }
}