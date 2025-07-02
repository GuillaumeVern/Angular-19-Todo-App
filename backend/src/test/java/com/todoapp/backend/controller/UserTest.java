package com.todoapp.backend.controller;

import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.todoapp.backend.model.UserBean;
import com.todoapp.backend.repository.TaskRepository;
import com.todoapp.backend.repository.UserRepository;

@SpringBootTest
public class UserTest {

        @Test
        public void getAllUsers() {
            UserRepository userRepository = mock(UserRepository.class);
            TaskRepository taskRepository = mock(TaskRepository.class);
            List<UserBean> users = List.of(
                new UserBean("John", "Doe", "john.doe@gmail.com"),
                new UserBean("Jane", "Doe", "jane.doe@gmail.com")
            );
            users.get(0).setId(1);
            users.get(1).setId(2);

            org.mockito.Mockito.when(userRepository.findAll()).thenReturn(users);

            UserController userController = new UserController(userRepository, taskRepository);

            List<UserBean> testUsers = userController.getAllUsers();

            UserBean user1 = new UserBean("John", "Doe", "john.doe@gmail.com");
            UserBean user2 = new UserBean("Jane", "Doe", "jane.doe@gmail.com");
            user1.setId(1);
            user2.setId(2);
            List<UserBean> expectedResult = List.of(user1, user2);

            for (int i = 0; i < users.size(); i++) {
                assertTrue("User " + i + " does not match expected result: " + testUsers.get(i), 
                    expectedResult.get(i).deepEquals(testUsers.get(i)));
            }
        }
}
