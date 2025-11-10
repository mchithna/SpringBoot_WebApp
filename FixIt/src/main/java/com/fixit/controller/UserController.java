package com.fixit.controller;

import com.fixit.dto.UserProfileDTO;
import com.fixit.entity.User;
import com.fixit.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController //
@RequestMapping("/api/users")
@PreAuthorize("hasRole('CUSTOMER')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getMyProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User user = userService.findByEmail(authentication.getName());

        UserProfileDTO dto = new UserProfileDTO();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getContactNo());
        dto.setAddress(user.getAddress());

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateMyProfile(@RequestBody UserProfileDTO profileDTO, Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        try {
            userService.updateProfile(user.getId(), profileDTO);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
