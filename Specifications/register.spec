


fn register(team_name, mail, password) {
    frontend_actions:
        - check :: regex(mail)
        - send-request-to-backend
    backend_actions:
        - check(db) :: collision(team_name), regex(mail)
        - save(db)  :: [pk<team_name>, mail, password]
        - send_results(db) -> frontend
}