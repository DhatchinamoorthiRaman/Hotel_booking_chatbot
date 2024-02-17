from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from chat import AskQuestion
from fastapi.middleware.cors import CORSMiddleware

class Question(BaseModel):
    question: str
    # description: str | None = None

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/chat/")
async def create_item(question: Question):
    return AskQuestion(question.question)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)