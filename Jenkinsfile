pipeline {
    agent any

    environment {
        TOMCAT_HOME = 'C:\\Program Files\\Apache Software Foundation\\Tomcat 10.1'
        WEBAPPS     = "${TOMCAT_HOME}\\webapps"
        MAVEN_REPO  = 'C:\\maven-repo'
    }

    options {
        timestamps()
    }

    stages {

        // ===== FRONTEND BUILD =====
        stage('Build Frontend') {
            steps {
                dir('EMPLOYEEAPI-REACT') {
                    bat 'npm ci || npm install'
                    bat 'npm run build'
                }
            }
        }

        // ===== FRONTEND DEPLOY =====
        stage('Deploy Frontend to Tomcat') {
            steps {
                bat '''
                if exist "%WEBAPPS%\\reactemployeeapi" (
                    rmdir /S /Q "%WEBAPPS%\\reactemployeeapi"
                )
                mkdir "%WEBAPPS%\\reactemployeeapi"
                xcopy /E /I /Y /Q EMPLOYEEAPI-REACT\\dist\\* "%WEBAPPS%\\reactemployeeapi"
                '''
            }
        }

        // ===== PREP MAVEN CACHE =====
        stage('Prepare Maven Dependencies') {
            steps {
                dir('EMPLOYEEAPI-SPRINGBOOT') {
                    retry(3) {
                        bat 'mvn -B -Dmaven.repo.local=%MAVEN_REPO% -Dorg.apache.maven.wagon.http.retryHandler.count=3 -Dorg.apache.maven.wagon.http.connectionTimeout=60000 -Dorg.apache.maven.wagon.http.readTimeout=120000 dependency:go-offline'
                    }
                }
            }
        }

        // ===== BACKEND BUILD =====
        stage('Build Backend') {
            steps {
                dir('EMPLOYEEAPI-SPRINGBOOT') {
                    retry(3) {
                        bat 'mvn -B -Dmaven.repo.local=%MAVEN_REPO% -DskipTests -Dorg.apache.maven.wagon.http.retryHandler.count=3 -Dorg.apache.maven.wagon.http.connectionTimeout=60000 -Dorg.apache.maven.wagon.http.readTimeout=120000 clean package'
                    }
                }
            }
        }

        // ===== BACKEND DEPLOY =====
        stage('Deploy Backend to Tomcat') {
            steps {
                bat '''
                rem Try WAR deploy to external Tomcat; if no WAR, deploy executable JAR instead.
                setlocal ENABLEDELAYEDEXPANSION
                set WAR_FILE=
                for %%f in (EMPLOYEEAPI-SPRINGBOOT\\target\\*.war) do set WAR_FILE=%%f

                if defined WAR_FILE (
                    echo WAR detected: %WAR_FILE%
                    if exist "%WEBAPPS%\\springbootemployeeapi.war" del /Q "%WEBAPPS%\\springbootemployeeapi.war"
                    if exist "%WEBAPPS%\\springbootemployeeapi" rmdir /S /Q "%WEBAPPS%\\springbootemployeeapi"
                    copy /Y "%WAR_FILE%" "%WEBAPPS%\\springbootemployeeapi.war"
                    endlocal
                    goto :EOF
                )

                echo No WAR found in EMPLOYEEAPI-SPRINGBOOT\\target. Deploying executable JAR on port 2031...
                set "DEPLOY_DIR=C:\\apps\\employee-api"
                if not exist "%DEPLOY_DIR%" mkdir "%DEPLOY_DIR%"

                set JAR_FILE=
                for %%j in (EMPLOYEEAPI-SPRINGBOOT\\target\\*SNAPSHOT.jar) do set JAR_FILE=%%j
                if not defined JAR_FILE for %%j in (EMPLOYEEAPI-SPRINGBOOT\\target\\*.jar) do set JAR_FILE=%%j

                if not defined JAR_FILE (
                    echo No JAR found to deploy in EMPLOYEEAPI-SPRINGBOOT\\target.
                    endlocal
                    exit /b 1
                )

                echo Using JAR: %JAR_FILE%
                copy /Y "%JAR_FILE%" "%DEPLOY_DIR%\\app.jar"

                rem Stop any existing instance running app.jar
                powershell -NoProfile -Command "Get-CimInstance Win32_Process ^| Where-Object { $_.CommandLine -match 'app\\.jar' } ^| ForEach-Object { Stop-Process -Id $_.ProcessId -Force }" 2>nul

                rem Start new instance in background
                powershell -NoProfile -Command "Start-Process -FilePath 'java' -ArgumentList @('-jar','-Dserver.port=2031','app.jar') -WorkingDirectory '%DEPLOY_DIR%' -WindowStyle Hidden"

                echo Backend started (executable JAR). Verify on http://localhost:2031/employeeapi
                endlocal
                '''
            }
        }

    }

    post {
        success {
            echo 'Deployment Successful!'
        }
        failure {
            echo 'Pipeline Failed.'
        }
    }
}