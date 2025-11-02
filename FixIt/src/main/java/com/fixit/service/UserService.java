package com.fixit.service;

import com.fixit.dto.UserProfileDTO;
import com.fixit.entity.User;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User save(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = findByEmail(email);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + email);
        }
        return user;
    }

    public User updateProfile(Long userId, UserProfileDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!user.getEmail().equals(dto.getEmail()) && userRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use");
        }
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setContactNo(dto.getPhone());
        user.setAddress(dto.getAddress());
        return userRepository.save(user);
    }

    public User suspendUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        System.out.println("Suspending user: " + user.getEmail());
        // userRepository.save(user);
        return user;
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public long getUserCount() {
        return userRepository.count();
    }
}