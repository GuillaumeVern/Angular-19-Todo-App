package com.todoapp.backend.repository;

import com.todoapp.backend.model.UserBean;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserBean, Long> {
    Optional<UserBean> findByEmail(String email);
    boolean existsByEmail(String email);
}