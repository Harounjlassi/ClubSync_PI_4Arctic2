package tn.esprit.clubsync.Services;

import tn.esprit.clubsync.entities.React;

import java.util.List;

public interface IReactService {
    React addReact(React react);
    void removeReact(Long id);
    React getReactById(Long id);
    List<React> getReactsByForumPost(Long postId);
    List<React> getReactsByAuthor(Long authorId);
    React updateReact(React react);
    long countReactsByPostAndType(Long postId, React.ReactType type);
}
