package com.fixit.repository;

import com.fixit.entity.Role;
import com.fixit.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    long countByRole(Role role);
    Page<User> findAllByRole(Role role, Pageable pageable);

}