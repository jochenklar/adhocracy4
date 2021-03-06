import rules


@rules.predicate
def is_member(user, project):
    if project:
        return project.has_member(user)
    return False


@rules.predicate
def is_public(user, project):
    if project:
        return project.is_public
    return False


@rules.predicate
def is_live(user, project):
    if project:
        return not project.is_draft
    return False


@rules.predicate
def is_moderator(user, project):
    if project:
        return user in project.moderators.all()
    return False
