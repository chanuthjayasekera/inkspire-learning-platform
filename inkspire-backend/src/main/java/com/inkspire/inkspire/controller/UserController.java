package com.inkspire.inkspire.controller;

import com.inkspire.inkspire.model.User;
import com.inkspire.inkspire.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ContentDisposition;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private final UserService userService;
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/profile-images/";

    public UserController(UserService userService) {
        this.userService = userService;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User not authenticated");
        }

        String email;
        if (authentication.getPrincipal() instanceof UserDetails userDetails) {
            email = userDetails.getUsername();
            return userService.getUserByEmail(email);
        } else if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            email = (String) oauth2User.getAttributes().get("email");
            return userService.processOAuth2User(oauth2User, "google");
        } else {
            throw new IllegalStateException("Unsupported authentication type");
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(Authentication authentication) {
        User currentUser = getAuthenticatedUser(authentication);
        List<User> users = userService.getAllUsers();
        List<Map<String, Object>> response = users.stream()
                .filter(user -> !user.getId().equals(currentUser.getId())) // Exclude current user
                .map(user -> {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", user.getId());
                    userMap.put("name", user.getName());
                    userMap.put("profileImage", user.getProfileImage());
                    userMap.put("isFollowing", userService.isFollowing(currentUser.getId(), user.getId()));
                    return userMap;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<Map<String, String>> followUser(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            User currentUser = getAuthenticatedUser(authentication);
            userService.followUser(currentUser.getId(), userId);
            return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<Map<String, String>> unfollowUser(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            User currentUser = getAuthenticatedUser(authentication);
            userService.unfollowUser(currentUser.getId(), userId);
            return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/profile-image")
    public ResponseEntity<Map<String, String>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            User user = getAuthenticatedUser(authentication);

            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String uniqueFileName = user.getId() + "_" + System.currentTimeMillis() + extension;
            String filePath = UPLOAD_DIR + uniqueFileName;

            File destFile = new File(filePath);
            file.transferTo(destFile);

            // Update user profile image path
            user.setProfileImage(uniqueFileName);
            userService.updateUser(user);

            return ResponseEntity.ok(Map.of("message", "Profile image uploaded successfully", "fileName", uniqueFileName));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload profile image: " + e.getMessage()));
        }
    }

    @GetMapping("/profile-image/{fileName}")
    public ResponseEntity<byte[]> getProfileImage(@PathVariable String fileName) {
        try {
            File file = new File(UPLOAD_DIR + fileName);
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) {
                contentType = "image/jpeg";
            }

            byte[] fileContent = Files.readAllBytes(file.toPath());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDisposition(ContentDisposition.builder("inline").filename(fileName).build());

            return ResponseEntity.ok().headers(headers).body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}