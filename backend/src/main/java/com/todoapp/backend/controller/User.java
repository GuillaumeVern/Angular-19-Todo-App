package com.todoapp.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class User {
    public User() {

    }

    @GetMapping("")
    public String getAllUsers() {

        return "all userssssss";
    }

    @PostMapping("create")
    public String createUser(String user) {
        return user;
    }
}
