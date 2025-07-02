package com.todoapp.backend.repository;

import com.todoapp.backend.model.TaskBean;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<TaskBean, Long> {
    List<TaskBean> findByUserId(Integer userId);
}