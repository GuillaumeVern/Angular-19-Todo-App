package com.todoapp.backend.model;

import org.hibernate.annotations.DynamicInsert;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;

@Entity
@DynamicInsert
@Table(name = "tasks", schema = "todoapp")
public class TaskBean {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(insertable = false, updatable = false, nullable = false)
    private Integer id;

    @NotBlank
    @Column(nullable = false)
    private String libelle;

    @Column(nullable = false)
    private Boolean completed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private UserBean user;

    public TaskBean() {
    }
    
    public TaskBean(String libelle, Boolean completed, UserBean user) {
        this.libelle = libelle;
        this.completed = completed;
        this.user = user;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLibelle() {
        return libelle;
    }

    public void setLibelle(String libelle) {
        this.libelle = libelle;
    }

    public Boolean isCompleted() {
        return completed;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public UserBean getUser() {
        return user;
    }

    public void setUser(UserBean user) {
        this.user = user;
    }


    public boolean deepEquals(TaskBean other) {
        if (this == other) return true;
        if (other == null || getClass() != other.getClass()) return false;

        TaskBean taskBean = (TaskBean) other;

        return id != null && id.equals(taskBean.id) &&
               libelle.equals(taskBean.libelle) &&
               completed.equals(taskBean.completed) &&
                (user != null ? user.deepEquals(taskBean.user) : taskBean.user == null);
    }

}
