package tn.esprit.clubsync.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@Table(name = "table_reply")
public class Reply {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id_reply;

    @Column(columnDefinition = "TEXT")
    String content;

    @ManyToOne
    @JoinColumn(name = "author_id")
    Users author;

    LocalDateTime reply_date;

    @ManyToOne
    @JoinColumn(name = "comment_id")
    @JsonIgnoreProperties({"replies", "forumPost"}) // Changed from @JsonIgnore
    Comment comment;

    public Long getId_reply() {
        return id_reply;
    }

    public void setId_reply(Long id_reply) {
        this.id_reply = id_reply;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Users getAuthor() {
        return author;
    }

    public void setAuthor(Users author) {
        this.author = author;
    }

    public LocalDateTime getReply_date() {
        return reply_date;
    }

    public void setReply_date(LocalDateTime reply_date) {
        this.reply_date = reply_date;
    }

    public void setComment(Comment comment) {
        this.comment = comment;
    }
}