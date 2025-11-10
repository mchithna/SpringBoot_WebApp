package com.fixit.service;

import com.fixit.dto.AdminUserViewDTO;
import com.fixit.dto.UserProfileDTO;
import com.fixit.entity.Role;
import com.fixit.entity.User;
import com.fixit.exception.ResourceNotFoundException;
import com.fixit.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        // Check if the password is not null AND does not already look like a BCrypt hash
        if (user.getPassword() != null && !user.getPassword().startsWith("$2a$")) {
            // This must be a new password (from registration), so hash it.
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        // If the password *does* start with "$2a$", we assume it's an existing,
        // hashed password from the DB and we DON'T touch it.
        return userRepository.save(user);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    // NEW: Find all CUSTOMER users with pagination
    @Transactional(readOnly = true)
    public Page<AdminUserViewDTO> findAllCustomers(Pageable pageable) {
        Page<User> userPage = userRepository.findAllByRole(Role.CUSTOMER, pageable);
        return userPage.map(AdminUserViewDTO::new); // Convert Page<User> to Page<AdminUserViewDTO>
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