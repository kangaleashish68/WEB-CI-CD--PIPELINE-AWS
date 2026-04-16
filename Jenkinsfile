pipeline {
    agent any

    stages {

        stage('Check Files') {
            steps {
                sh 'pwd'
                sh 'ls -l'
            }
        }

        stage('Build Image') {
            steps {
                sh '/usr/bin/docker build -t task-app:v1 ./app'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                /usr/bin/docker stop task-container || true
                /usr/bin/docker rm task-container || true
                /usr/bin/docker run -d -p 3001:3000 --name task-container task-app:v1
                '''
            }
        }
    }
}
