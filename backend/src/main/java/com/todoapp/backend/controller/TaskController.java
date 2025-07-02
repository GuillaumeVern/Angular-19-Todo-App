package com.todoapp.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.todoapp.backend.model.TaskBean;
import com.todoapp.backend.repository.TaskRepository;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<TaskBean> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/{id}")
    public TaskBean getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id).orElse(null);
    }

    @PostMapping
    public TaskBean createTask(@RequestBody TaskBean task) {
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public TaskBean updateTask(@PathVariable Long id, @RequestBody TaskBean taskDetails) {
        return taskRepository.findById(id)
            .map(task -> {
                task.setLibelle(taskDetails.getLibelle());
                task.setCompleted(taskDetails.isCompleted());
                return taskRepository.save(task);
            })
            .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskRepository.deleteById(id);
    }
}
