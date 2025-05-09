// Backend/controller/PostController.java
package Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Backend.model.PostModel;
import Backend.repository.PostRepository;
import Backend.exception.PostNotFoundException;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api")
public class PostController {
    @Autowired
    private PostRepository postRepository;

    // CREATE - Add a new post
    @PostMapping("/posts")
    public PostModel createPost(@RequestBody PostModel newPost) {
        // Validate media URLs (max 3)
        if (newPost.getMediaUrls() != null && newPost.getMediaUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum 3 media files allowed per post");
        }
        
        return postRepository.save(newPost);
    }

    // READ - Get all posts
    @GetMapping("/posts")
    public List<PostModel> getAllPosts() {
        return postRepository.findAll();
    }

    // READ - Get a single post by ID
    @GetMapping("/posts/{id}")
    public PostModel getPostById(@PathVariable Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    // UPDATE - Update a post
    @PutMapping("/posts/{id}")
    public PostModel updatePost(@RequestBody PostModel updatedPost, @PathVariable Long id) {
        // Validate media URLs (max 3)
        if (updatedPost.getMediaUrls() != null && updatedPost.getMediaUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum 3 media files allowed per post");
        }
        
        return postRepository.findById(id)
                .map(post -> {
                    post.setTitle(updatedPost.getTitle());
                    post.setContent(updatedPost.getContent());
                    post.setTags(updatedPost.getTags());
                    post.setMediaUrls(updatedPost.getMediaUrls());
                    return postRepository.save(post);
                })
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    // DELETE - Delete a post
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        return postRepository.findById(id)
                .map(post -> {
                    postRepository.delete(post);
                    return ResponseEntity.ok().build();
                })
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    // LIKE - Add a like to a post
    @PutMapping("/posts/{id}/like/{userId}")
    public PostModel likePost(@PathVariable Long id, @PathVariable Long userId) {
        return postRepository.findById(id)
                .map(post -> {
                    List<Long> likes = post.getLikes();
                    if (!likes.contains(userId)) {
                        likes.add(userId);
                        post.setLikes(likes);
                    }
                    return postRepository.save(post);
                })
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    // UNLIKE - Remove a like from a post
    @PutMapping("/posts/{id}/unlike/{userId}")
    public PostModel unlikePost(@PathVariable Long id, @PathVariable Long userId) {
        return postRepository.findById(id)
                .map(post -> {
                    List<Long> likes = post.getLikes();
                    likes.removeIf(likeId -> likeId.equals(userId));
                    post.setLikes(likes);
                    return postRepository.save(post);
                })
                .orElseThrow(() -> new PostNotFoundException(id));
    }
}