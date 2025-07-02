package com.todoapp.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.todoapp.backend.exceptions.ResourceNotFoundException;
import com.todoapp.backend.model.TaskBean;
import com.todoapp.backend.model.UserBean;
import com.todoapp.backend.repository.TaskRepository;
import com.todoapp.backend.repository.UserRepository;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public UserController(UserRepository userRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    @GetMapping
    public List<UserBean> getAllUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserBean> getUserByEmail(@RequestParam String email) {
        return userRepository.findByEmail(email)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserBean> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserBean> createUser(@RequestBody UserBean user) {
        UserBean savedUser = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserBean> updateUser(@PathVariable Long id, @RequestBody UserBean userDetails) {
        return userRepository.findById(id)
            .map(user -> {
                user.setNom(userDetails.getNom());
                user.setPrenom(userDetails.getPrenom());
                user.setEmail(userDetails.getEmail());
                UserBean updatedUser = userRepository.save(user);
                return ResponseEntity.ok(updatedUser);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.noContent().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/{userId}/tasks")
    public TaskBean createTaskForUser(@PathVariable Long userId, @RequestBody TaskBean task) {
        UserBean user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        task.setUser(user);
        return taskRepository.save(task);
    }

    @GetMapping("/{userId}/tasks")
    public List<TaskBean> getTasksByUserId(@PathVariable Long userId) {
        UserBean user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return taskRepository.findByUserId(user.getId());
    }

    @GetMapping("/{userId}/tasks/{taskId}")
    public ResponseEntity<TaskBean> getTaskByUserIdAndTaskId(@PathVariable Long userId, @PathVariable Long taskId) {
        UserBean user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return taskRepository.findById(taskId)
                .filter(task -> task.getUser().getId().equals(user.getId()))
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found for user"));
    }

    @PutMapping("/{userId}/tasks/{taskId}")
    public ResponseEntity<TaskBean> updateTaskForUser(@PathVariable Long userId, @PathVariable Long taskId,
            @RequestBody TaskBean taskDetails) {
        UserBean user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return taskRepository.findById(taskId)
                .filter(task -> task.getUser().getId().equals(user.getId()))
                .map(task -> {
                    task.setLibelle(taskDetails.getLibelle());
                    task.setCompleted(taskDetails.isCompleted());
                    TaskBean updatedTask = taskRepository.save(task);
                    return ResponseEntity.ok(updatedTask);
                })
                .orElseThrow(() -> new ResourceNotFoundException("Task not found for user"));
    }

    @DeleteMapping("/{userId}/tasks/{taskId}")
    public ResponseEntity<Object> deleteTaskForUser(@PathVariable Long userId, @PathVariable Long taskId) {
        UserBean user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return taskRepository.findById(taskId)
                .filter(task -> task.getUser().getId().equals(user.getId()))
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.noContent().build();
                })
                .orElseThrow(() -> new ResourceNotFoundException("Task not found for user"));
    }

}
