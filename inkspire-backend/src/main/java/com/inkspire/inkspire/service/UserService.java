package com.inkspire.inkspire.service;

import com.inkspire.inkspire.model.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.List;

public interface UserService extends UserDetailsService {
    User registerUser(User user);
    String loginUser(String email, String password);
    User updateUser(User user);
    void deleteUser(Long userId);
    User getUserById(Long userId);
    User getUserByEmail(String email);
    boolean resetPassword(String email, String newPassword);
    User processOAuth2User(OAuth2User oAuth2User, String provider);
    User processOAuth2User(String email, String name, String provider);
    boolean isPhoneNumberTaken(String phoneNumber);
    List<User> getAllUsers();
    void followUser(Long followerId, Long followeeId);
    void unfollowUser(Long followerId, Long followeeId);
    boolean isFollowing(Long followerId, Long followeeId);
}