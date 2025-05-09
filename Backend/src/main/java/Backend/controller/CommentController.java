package Backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Backend.model.CommentModel;
import Backend.repository.CommentRepository;
import Backend.repository.PostRepository;
import Backend.exception.PostNotFoundException;
import Backend.exception.CommentNotFoundException;
import Backend.exception.UnauthorizedAccessException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("http://localhost:3000")
@RequestMapping("/api")
public class CommentController {
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;

    // CREATE - Add a new comment to a post
    @PostMapping("/posts/{postId}/comments")
    public CommentModel createComment(@PathVariable Long postId, @RequestBody CommentModel newComment) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException(postId);
        }
        
        newComment.setPostId(postId);
        return commentRepository.save(newComment);
    }

    // CREATE - Add a reply to a comment
    @PostMapping("/comments/{commentId}/replies")
    public CommentModel createReply(@PathVariable Long commentId, @RequestBody CommentModel reply) {
        // Verify parent comment exists
        CommentModel parentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));
        
        reply.setPostId(parentComment.getPostId());
        reply.setParentCommentId(commentId);
        return commentRepository.save(reply);
    }

    // READ - Get all comments for a post
    @GetMapping("/posts/{postId}/comments")
    public List<CommentModel> getCommentsByPost(@PathVariable Long postId) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException(postId);
        }
        
        return commentRepository.findByPostId(postId);
    }

    // READ - Get all top-level comments for a post (excluding replies)
    @GetMapping("/posts/{postId}/top-comments")
    public List<CommentModel> getTopCommentsByPost(@PathVariable Long postId) {
        // Verify post exists
        if (!postRepository.existsById(postId)) {
            throw new PostNotFoundException(postId);
        }
        
        return commentRepository.findByPostIdAndParentCommentIdIsNull(postId);
    }

    // READ - Get all replies to a comment
    @GetMapping("/comments/{commentId}/replies")
    public List<CommentModel> getRepliesByComment(@PathVariable Long commentId) {
        // Verify comment exists
        if (!commentRepository.existsById(commentId)) {
            throw new CommentNotFoundException(commentId);
        }
        
        return commentRepository.findByParentCommentId(commentId);
    }

    // READ - Get a single comment by ID
    @GetMapping("/comments/{id}")
    public CommentModel getCommentById(@PathVariable Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new CommentNotFoundException(id));
    }

    // UPDATE - Update a comment (basic version)
    @PutMapping("/comments/{id}")
    public CommentModel updateComment(@PathVariable Long id, @RequestBody CommentModel updatedComment) {
        return commentRepository.findById(id)
                .map(comment -> {
                    comment.setContent(updatedComment.getContent());
                    // The @PreUpdate will automatically update the timestamp
                    return commentRepository.save(comment);
                })
                .orElseThrow(() -> new CommentNotFoundException(id));
    }
    
    // UPDATE - Update a comment with user verification
    @PutMapping("/comments/{id}/edit")
    public ResponseEntity<?> editComment(
            @PathVariable Long id, 
            @RequestParam Long userId,
            @RequestBody Map<String, String> updates) {
        
        return commentRepository.findById(id)
                .map(comment -> {
                    // Check if the user is authorized to edit this comment
                    if (!comment.getUserId().equals(userId)) {
                        throw new UnauthorizedAccessException("You don't have permission to edit this comment");
                    }
                    
                    // Update the content if provided
                    if (updates.containsKey("content")) {
                        comment.setContent(updates.get("content"));
                    }
                    
                    // Save the updated comment
                    CommentModel updatedComment = commentRepository.save(comment);
                    return ResponseEntity.ok(updatedComment);
                })
                .orElseThrow(() -> new CommentNotFoundException(id));
    }

    // DELETE - Delete a comment
    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        return commentRepository.findById(id)
                .map(comment -> {
                    commentRepository.delete(comment);
                    return ResponseEntity.ok().build();
                })
                .orElseThrow(() -> new CommentNotFoundException(id));
    }

    // LIKE - Add a like to a comment
    @PutMapping("/comments/{id}/like/{userId}")
    public CommentModel likeComment(@PathVariable Long id, @PathVariable Long userId) {
        return commentRepository.findById(id)
                .map(comment -> {
                    List<Long> likes = comment.getLikes();
                    if (!likes.contains(userId)) {
                        likes.add(userId);
                        comment.setLikes(likes);
                    }
                    return commentRepository.save(comment);
                })
                .orElseThrow(() -> new CommentNotFoundException(id));
    }

    // UNLIKE - Remove a like from a comment
    @PutMapping("/comments/{id}/unlike/{userId}")
    public CommentModel unlikeComment(@PathVariable Long id, @PathVariable Long userId) {
        return commentRepository.findById(id)
                .map(comment -> {
                    List<Long> likes = comment.getLikes();
                    likes.removeIf(likeId -> likeId.equals(userId));
                    comment.setLikes(likes);
                    return commentRepository.save(comment);
                })
                .orElseThrow(() -> new CommentNotFoundException(id));
    }
}