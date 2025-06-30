package com.todoapp.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UserTest {

        @Test
        public void userTest() {
            User user = new User();
            String expectedResult = "all userssssss";
            assertEquals(expectedResult, user.getAllUsers());
        }
}
