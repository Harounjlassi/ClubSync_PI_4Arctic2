package tn.esprit.clubsync.entities;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String isbn;

    private String publisher;

    private LocalDate publicationDate;

    private String genre;

    private String description;

    private String language;

    private Integer pageCount;

    private Boolean available = true;

    private Integer totalCopies;

    private Integer availableCopies;

    private String coverImageUrl;
}