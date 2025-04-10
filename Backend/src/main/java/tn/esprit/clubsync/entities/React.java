package tn.esprit.clubsync.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "table-react")
public class React {


    public enum ReactType {
        LIKE, LOVE, HAHA, WOW, SAD, ANGRY
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id_react;


    @Enumerated(EnumType.STRING)
    private ReactType type;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private Users author;

    private LocalDateTime react_date;

    @ManyToOne
    @JoinColumn(name = "forum_post_id")
    private ForumPost forumPost;

    public Long getId_react() {
        return id_react;
    }

    public void setId_react(Long id_react) {
        this.id_react = id_react;
    }

    public ReactType getType() {
        return type;
    }

    public void setType(ReactType type) {
        this.type = type;
    }

    public Users getAuthor() {
        return author;
    }

    public void setAuthor(Users author) {
        this.author = author;
    }

    public LocalDateTime getReact_date() {
        return react_date;
    }

    public void setReact_date(LocalDateTime react_date) {
        this.react_date = react_date;
    }

    public ForumPost getForumPost() {
        return forumPost;
    }

    public void setForumPost(ForumPost forumPost) {
        this.forumPost = forumPost;
    }
}
