// Backend/model/PostModel.java
package Backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
public class PostModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String content;

    @ElementCollection
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    private List<Long> likes = new ArrayList<>();
    
    // New field for storing media URLs (images/videos)
    @ElementCollection
    @Column(length = 1000)
    private List<String> mediaUrls = new ArrayList<>();
    
    @Column(nullable = false)
    private Long userId;
    
    // New field for storing username
    @Column(length = 100)
    private String username;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    // Default constructor
    public PostModel() {
    }

    // Parameterized constructor
    public PostModel(String title, String content, Long userId, String username) {
        this.title = title;
        this.content = content;
        this.userId = userId;
        this.username = username;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Full parameterized constructor
    public PostModel(String title, String content, List<String> tags, List<Long> likes, List<String> mediaUrls, Long userId, String username) {
        this.title = title;
        this.content = content;
        this.tags = tags;
        this.likes = likes;
        this.mediaUrls = mediaUrls;
        this.userId = userId;
        this.username = username;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<Long> getLikes() {
        return likes;
    }

    public void setLikes(List<Long> likes) {
        this.likes = likes;
    }
    
    public List<String> getMediaUrls() {
        return mediaUrls;
    }
    
    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}