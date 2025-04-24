package tn.esprit.clubsync.entities;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "table-forumpost")
public class ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_post;

    @Column(columnDefinition = "TEXT")
    private String content;

    public Long getId_post() {
        return id_post;
    }

    public void setId_post(Long id_post) {
        this.id_post = id_post;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public User getAuthor() {
        return author;
    }

    public void setAuthor(User author) {
        this.author = author;
    }

    public LocalDateTime getPost_date() {
        return post_date;
    }

    public void setPost_date(LocalDateTime post_date) {
        this.post_date = post_date;
    }

    public Discussion getDiscussion() {
        return discussion;
    }

    public void setDiscussion(Discussion discussion) {
        this.discussion = discussion;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    private LocalDateTime post_date;

    @ManyToOne
    @JoinColumn(name = "discussion_id")
    private Discussion discussion;

    @OneToMany(mappedBy = "forumPost", cascade = CascadeType.ALL)
    private List<Comment> comments = new ArrayList<>();
}
