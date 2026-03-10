package com.inkspire.inkspire.service.impl;

import com.inkspire.inkspire.config.JwtTokenProvider;
import com.inkspire.inkspire.model.User;
import com.inkspire.inkspire.model.UserFollow;
import com.inkspire.inkspire.repository.UserFollowRepository;
import com.inkspire.inkspire.repository.UserRepository;
import com.inkspire.inkspire.service.UserService;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserFollowRepository userFollowRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    public UserServiceImpl(
            UserRepository userRepository,
            UserFollowRepository userFollowRepository,
            PasswordEncoder passwordEncoder,
            @Lazy AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.userRepository = userRepository;
        this.userFollowRepository = userFollowRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public User registerUser(User user) {
        try {
            System.out.println("Registering user: " + user.getEmail());
            if (userRepository.findByEmail(user.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists: " + user.getEmail());
            }
            if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
                throw new RuntimeException("Phone number already exists: " + user.getPhoneNumber());
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setEnabled(true);
            User savedUser = userRepository.save(user);
            System.out.println("User saved to database with ID: " + savedUser.getId());
            return savedUser;
        } catch (Exception e) {
            throw new RuntimeException("Failed to register user: " + e.getMessage());
        }
    }

    @Override
    public String loginUser(String email, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password)
            );
            return jwtTokenProvider.generateToken(authentication);
        } catch (Exception e) {
            throw new RuntimeException("Invalid email or password: " + e.getMessage());
        }
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Override
    public User updateUser(User user) {
        try {
            if (user.getName() == null || user.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Name cannot be empty");
            }
            if (user.getPhoneNumber() == null || !user.getPhoneNumber().matches("^\\+?\\d{7,15}$")) {
                throw new IllegalArgumentException("Invalid phone number format. Use 7-15 digits, optional '+' prefix.");
            }

            // Check phone number uniqueness (excluding current user)
            Optional<User> existingUser = userRepository.findByPhoneNumber(user.getPhoneNumber());
            if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
                throw new IllegalArgumentException("Phone number is already in use");
            }

            user.setUpdatedAt(LocalDateTime.now());
            return userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update user: " + e.getMessage());
        }
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Override
    public boolean resetPassword(String email, String newPassword) {
        try {
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return true;
            }
            return false;
        } catch (Exception e) {
            throw new RuntimeException("Failed to reset password: " + e.getMessage());
        }
    }

    @Override
    public User processOAuth2User(String email, String name, String provider) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    existingUser.setProvider(provider);
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    newUser.setProvider(provider);
                    newUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
                    return userRepository.save(newUser);
                });
    }

    @Override
    public User processOAuth2User(OAuth2User oAuth2User, String provider) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        return processOAuth2User(email, name, provider);
    }

    @Override
    public boolean isPhoneNumberTaken(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return false;
        }
        return userRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAllByEnabledTrue();
    }

    @Override
    public void followUser(Long followerId, Long followeeId) {
        if (followerId.equals(followeeId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }
        User follower = getUserById(followerId);
        User followee = getUserById(followeeId);
        if (userFollowRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId)) {
            throw new RuntimeException("Already following this user");
        }
        UserFollow userFollow = new UserFollow();
        userFollow.setFollower(follower);
        userFollow.setFollowee(followee);
        userFollowRepository.save(userFollow);
    }

    @Override
    public void unfollowUser(Long followerId, Long followeeId) {
        Optional<UserFollow> userFollow = userFollowRepository.findByFollowerIdAndFolloweeId(followerId, followeeId);
        if (userFollow.isPresent()) {
            userFollowRepository.delete(userFollow.get());
        } else {
            throw new RuntimeException("Not following this user");
        }
    }

    @Override
    public boolean isFollowing(Long followerId, Long followeeId) {
        return userFollowRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);
    }
}